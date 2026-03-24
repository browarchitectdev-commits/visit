import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const DEFAULT_DATA = {
  bookings: [],
  conversations: {},
  meta: {
    nextBookingId: 1,
  },
};

export class JsonStorage {
  constructor(filePath) {
    this.filePath = resolve(filePath);
    this.writeQueue = Promise.resolve();
  }

  async ensureFile() {
    await mkdir(dirname(this.filePath), { recursive: true });

    try {
      await readFile(this.filePath, 'utf8');
    } catch {
      await writeFile(this.filePath, JSON.stringify(DEFAULT_DATA, null, 2), 'utf8');
    }
  }

  async read() {
    await this.ensureFile();
    const raw = await readFile(this.filePath, 'utf8');
    return JSON.parse(raw);
  }

  async write(data) {
    await this.ensureFile();
    this.writeQueue = this.writeQueue.then(() =>
      writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8'),
    );
    await this.writeQueue;
  }

  async update(updater) {
    const data = await this.read();
    const nextData = await updater(data);
    await this.write(nextData);
    return nextData;
  }
}
