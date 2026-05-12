import { createClient } from '@supabase/supabase-js';

const DEFAULT_DATA = {
  bookings: [],
  conversations: {},
  meta: {
    nextBookingId: 1,
  },
};

const cloneDefaultData = () => JSON.parse(JSON.stringify(DEFAULT_DATA));

const normalizePrefix = (prefix) => String(prefix || 'bot_vercel').replace(/[^a-zA-Z0-9_]/g, '_');

export class SupabaseStorage {
  constructor({ supabaseUrl, serviceRoleKey, tablePrefix = 'bot_vercel' }) {
    this.supabaseUrl = supabaseUrl;
    this.serviceRoleKey = serviceRoleKey;
    this.tablePrefix = normalizePrefix(tablePrefix);
    this.client = null;
    this.writeQueue = Promise.resolve();
  }

  get bookingsTable() {
    return `${this.tablePrefix}_bookings`;
  }

  get conversationsTable() {
    return `${this.tablePrefix}_conversations`;
  }

  get metaTable() {
    return `${this.tablePrefix}_meta`;
  }

  get processedUpdatesTable() {
    return `${this.tablePrefix}_processed_updates`;
  }

  getClient() {
    if (!this.supabaseUrl || !this.serviceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for bot_vercel storage');
    }

    if (!this.client) {
      this.client = createClient(this.supabaseUrl, this.serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }

    return this.client;
  }

  async read() {
    const supabase = this.getClient();
    const data = cloneDefaultData();

    const [bookingsResult, conversationsResult, metaResult] = await Promise.all([
      supabase.from(this.bookingsTable).select('id,data').order('id', { ascending: false }),
      supabase.from(this.conversationsTable).select('user_id,data'),
      supabase.from(this.metaTable).select('key,value').eq('key', 'state').maybeSingle(),
    ]);

    if (bookingsResult.error) {
      throw bookingsResult.error;
    }

    if (conversationsResult.error) {
      throw conversationsResult.error;
    }

    if (metaResult.error) {
      throw metaResult.error;
    }

    data.bookings = (bookingsResult.data ?? []).map((row) => row.data);
    data.conversations = Object.fromEntries(
      (conversationsResult.data ?? []).map((row) => [String(row.user_id), row.data]),
    );
    data.meta = {
      ...data.meta,
      ...(metaResult.data?.value ?? {}),
    };

    return data;
  }

  async write(data) {
    this.writeQueue = this.writeQueue.then(async () => {
      const supabase = this.getClient();
      const bookings = data.bookings ?? [];
      const conversations = data.conversations ?? {};
      const bookingIds = bookings.map((booking) => booking.id);
      const conversationIds = Object.keys(conversations);

      if (bookingIds.length > 0) {
        const upsertResult = await supabase.from(this.bookingsTable).upsert(
          bookings.map((booking) => ({
            id: booking.id,
            telegram_user_id: booking.telegramUserId,
            status: booking.status,
            data: booking,
            updated_at: booking.updatedAt ?? new Date().toISOString(),
          })),
          { onConflict: 'id' },
        );

        if (upsertResult.error) {
          throw upsertResult.error;
        }
      }

      const deleteBookingsQuery = supabase.from(this.bookingsTable).delete();
      const deleteBookingsResult =
        bookingIds.length > 0
          ? await deleteBookingsQuery.not('id', 'in', `(${bookingIds.join(',')})`)
          : await deleteBookingsQuery.neq('id', 0);

      if (deleteBookingsResult.error) {
        throw deleteBookingsResult.error;
      }

      if (conversationIds.length > 0) {
        const upsertResult = await supabase.from(this.conversationsTable).upsert(
          conversationIds.map((userId) => ({
            user_id: userId,
            data: conversations[userId],
            updated_at: new Date().toISOString(),
          })),
          { onConflict: 'user_id' },
        );

        if (upsertResult.error) {
          throw upsertResult.error;
        }
      }

      const deleteConversationsQuery = supabase.from(this.conversationsTable).delete();
      const deleteConversationsResult =
        conversationIds.length > 0
          ? await deleteConversationsQuery.not('user_id', 'in', `(${conversationIds.join(',')})`)
          : await deleteConversationsQuery.neq('user_id', '');

      if (deleteConversationsResult.error) {
        throw deleteConversationsResult.error;
      }

      const metaResult = await supabase.from(this.metaTable).upsert(
        {
          key: 'state',
          value: data.meta ?? DEFAULT_DATA.meta,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' },
      );

      if (metaResult.error) {
        throw metaResult.error;
      }
    });

    await this.writeQueue;
  }

  async update(updater) {
    const data = await this.read();
    const nextData = await updater(data);
    await this.write(nextData);
    return nextData;
  }

  async markUpdateProcessed(updateId) {
    if (!Number.isFinite(Number(updateId))) {
      return false;
    }

    const supabase = this.getClient();
    const result = await supabase.from(this.processedUpdatesTable).insert({
      update_id: Number(updateId),
      processed_at: new Date().toISOString(),
    });

    if (!result.error) {
      return true;
    }

    if (result.error.code === '23505') {
      return false;
    }

    throw result.error;
  }

  async forgetProcessedUpdate(updateId) {
    if (!Number.isFinite(Number(updateId))) {
      return;
    }

    const supabase = this.getClient();
    const result = await supabase
      .from(this.processedUpdatesTable)
      .delete()
      .eq('update_id', Number(updateId));

    if (result.error) {
      throw result.error;
    }
  }
}
