import { defineConfig, TinaMediaStore } from 'tinacms';
import type { MediaUploadOptions, TinaCMS } from 'tinacms';

// Configurazione TinaCMS
// Tutte le collezioni sono sincronizzate con src/content/config.ts

const argv = typeof process !== 'undefined' && Array.isArray(process.argv) ? process.argv : [];
const isTinaDevCommand = argv.includes('dev');
const isLocalOnly = process.env.TINA_LOCAL_ONLY === 'true' && isTinaDevCommand;
const tinaClientId = isLocalOnly ? undefined : process.env.TINA_CLIENT_ID;
const tinaToken = isLocalOnly ? undefined : process.env.TINA_TOKEN;

const sanitizeMediaBasename = (filename: string) => {
  const basename = filename.replace(/\.[^.]+$/, '');
  return basename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'image';
};

const buildUniqueMediaName = (filename: string, index: number) => {
  const extensionMatch = filename.match(/(\.[^.]+)$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';
  const safeBase = sanitizeMediaBasename(filename);
  const timestamp = Date.now() + index;
  const randomSuffix = Math.random().toString(36).slice(2, 8);

  return `${timestamp}-${randomSuffix}-${safeBase}${extension}`;
};

class UniqueFilenameMediaStore extends TinaMediaStore {
  async persist(files: MediaUploadOptions[]) {
    const renamedFiles = files.map((item, index) => ({
      ...item,
      file: new File([item.file], buildUniqueMediaName(item.file.name, index), {
        type: item.file.type,
        lastModified: item.file.lastModified,
      }),
    }));

    return super.persist(renamedFiles);
  }
}

export default defineConfig({
  // Archivio Git-based
  branch: 'main',
  clientId: tinaClientId,
  token: tinaToken,
  
  // Configurazione build
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  cmsCallback: (cms: TinaCMS) => {
    cms.media.store = new UniqueFilenameMediaStore(cms);
    return cms;
  },

  // Configurazione media
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },

  // Schemi delle collezioni
  schema: {
    collections: [
      /**
       * Collezione "Servizi"
       * Sincronizzata con src/content/services/
       */
      {
        label: 'Servizi',
        name: 'services',
        path: 'src/content/services',
        format: 'json',
        fields: [
          {
            type: 'string',
            label: 'Nome del servizio',
            name: 'name',
            description: 'Esempio: Trucco permanente sopracciglia',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value || value.length < 3) {
                  return 'Il nome deve contenere almeno 3 caratteri';
                }
                if (value.length > 100) {
                  return 'Il nome è troppo lungo (massimo 100 caratteri)';
                }
              },
            },
          },
          {
            type: 'number',
            label: 'Prezzo (EUR)',
            name: 'price',
            description: 'Prezzo del servizio in euro',
            required: true,
          },
          {
            type: 'number',
            label: 'Durata (min)',
            name: 'duration',
            description: 'Durata della procedura in minuti',
            required: true,
          },
          {
            type: 'string',
            label: 'Descrizione',
            name: 'description',
            description: 'Descrizione dettagliata del servizio',
            required: true,
            ui: {
              component: 'textarea',
              validate: (value: any) => {
                if (!value || value.length < 20) {
                  return 'La descrizione deve contenere almeno 20 caratteri';
                }
                if (value.length > 1000) {
                  return 'La descrizione è troppo lunga (massimo 1000 caratteri)';
                }
              },
            },
          },
          {
            type: 'image',
            label: 'Immagine del servizio',
            name: 'image',
            description: 'JPG o PNG, minimo 400x300px',
            required: true,
          },
          {
            type: 'number',
            label: 'Ordine di visualizzazione',
            name: 'order',
            description: 'I servizi vengono ordinati in base a questo valore',
          },
          {
            type: 'boolean',
            label: 'Attivo',
            name: 'isActive',
            description: 'Mostrare questo servizio sul sito',
            ui: { defaultValue: true },
          },
        ],
      },

      /**
       * Collezione "Team"
       * Sincronizzata con src/content/masters/
       */
      {
        label: 'Team',
        name: 'masters',
        path: 'src/content/masters',
        format: 'json',
        fields: [
          {
            type: 'string',
            label: 'Nome completo',
            name: 'name',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value || value.length < 2) {
                  return 'Il nome è troppo corto';
                }
                if (value.length > 100) {
                  return 'Il nome è troppo lungo';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'Ruolo',
            name: 'position',
            description: 'Esempio: Specialista in trucco permanente',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value || value.length < 3) {
                  return 'Indica il ruolo';
                }
                if (value.length > 150) {
                  return 'Il ruolo è troppo lungo';
                }
              },
            },
          },
          {
            type: 'number',
            label: 'Esperienza (anni)',
            name: 'experience',
            description: 'Numero di anni di esperienza',
            required: true,
          },
          {
            type: 'string',
            label: 'Biografia',
            name: 'bio',
            description: 'Descrizione completa, risultati e certificazioni',
            required: true,
            ui: {
              component: 'textarea',
              validate: (value: any) => {
                if (!value || value.length < 50) {
                  return 'La biografia deve essere dettagliata (minimo 50 caratteri)';
                }
                if (value.length > 2000) {
                  return 'La biografia è troppo lunga (massimo 2000 caratteri)';
                }
              },
            },
          },
          {
            type: 'image',
            label: 'Fotografia',
            name: 'photo',
            description: 'Foto ritratto, minimo 300x300px',
            required: true,
          },
          {
            type: 'string',
            label: 'Instagram',
            name: 'instagram',
            description: 'Link completo al profilo (opzionale)',
            ui: {
              validate: (value: any) => {
                if (value && !value.startsWith('http')) {
                  return 'Inserisci un link completo (https://...)';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'Telegram',
            name: 'telegram',
            description: 'Link completo al profilo (opzionale)',
            ui: {
              validate: (value: any) => {
                if (value && !value.startsWith('http')) {
                  return 'Inserisci un link completo (https://...)';
                }
              },
            },
          },
          {
            type: 'number',
            label: 'Ordine di visualizzazione',
            name: 'order',
            description: 'I profili vengono ordinati in base a questo valore',
          },
          {
            type: 'boolean',
            label: 'Attivo',
            name: 'isActive',
            description: 'Mostrare questo profilo sul sito',
            ui: { defaultValue: true },
          },
        ],
      },

      /**
       * Collezione "Portfolio"
       * Sincronizzata con src/content/gallery/
       */
      {
        label: 'Portfolio',
        name: 'gallery',
        path: 'src/content/gallery',
        format: 'json',
        fields: [
          {
            type: 'string',
            label: 'Titolo del lavoro',
            name: 'title',
            description: 'Esempio: Trucco permanente sopracciglia',
            required: true,
          },
          {
            type: 'string',
            label: 'Categoria',
            name: 'category',
            description: 'Tipo di servizio',
            required: true,
            options: [
              { label: 'Sopracciglia', value: 'brouws' },
              { label: 'Labbra', value: 'lips' },
              { label: 'Eyeliner infracigliare', value: 'eyeliner' },
              { label: 'Unghie', value: 'nails' },
              { label: 'Viso', value: 'face' },
              { label: 'Altro', value: 'other' },
            ],
          },
          {
            type: 'string',
            label: 'Descrizione',
            name: 'description',
            description: 'Descrizione del lavoro eseguito',
            required: true,
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'image',
            label: 'Foto "prima"',
            name: 'imageBefore',
            description: 'Fotografia prima della procedura',
            required: true,
          },
          {
            type: 'image',
            label: 'Foto "dopo"',
            name: 'imageAfter',
            description: 'Fotografia dopo la procedura',
            required: true,
          },
          {
            type: 'string',
            label: 'Nome specialista',
            name: 'masterName',
            description: 'Chi ha eseguito il lavoro (opzionale)',
          },
          {
            type: 'datetime',
            label: 'Data del lavoro',
            name: 'date',
            description: 'Quando è stato eseguito il lavoro (opzionale)',
          },
          {
            type: 'number',
            label: 'Ordine di visualizzazione',
            name: 'order',
            description: 'I lavori vengono ordinati in base a questo valore',
          },
          {
            type: 'boolean',
            label: 'Attivo',
            name: 'isActive',
            description: 'Mostrare questo lavoro sul sito',
            ui: { defaultValue: true },
          },
        ],
      },
      /**
       * Collezione "Social"
       * Sincronizzata con src/content/social/
       */
      {
        label: 'Social',
        name: 'social',
        path: 'src/content/social',
        format: 'json',
        ui: {
          allowedActions: {
            create: true,
            delete: true,
          },
          // Genera automaticamente il nome del file dal link del post.
          filename: {
            slugify: (values: any) => {
              const platform = String(values?.platform ?? 'instagram').toLowerCase();
              const postUrl = String(values?.postUrl ?? '');
              const instagramMatch = postUrl.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
              const tiktokMatch = postUrl.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
                if (platform === 'tiktok' && tiktokMatch?.[1]) {
                return `tiktok-${tiktokMatch[1]}`;
              }

              if (platform === 'facebook') {
                const fbId = postUrl.match(/\/(?:posts|videos|reel|photo).*?(\d{10,})/)?.[1]
                  ?? postUrl.match(/fbid=(\d+)/)?.[1];
                return fbId ? `facebook-${fbId}` : `facebook-post-${Date.now().toString().slice(-6)}`;
              }

              if (instagramMatch?.[1]) {
                return `instagram-${instagramMatch[1].toLowerCase()}`;
              }

              const fallback = Date.now().toString().slice(-6);
              return `${platform}-post-${fallback}`;
            },
          },
        },
        fields: [
          {
            type: 'string',
            label: 'Piattaforma',
            name: 'platform',
            description: 'Scegli la piattaforma da mostrare nella scheda',
            required: true,
            options: [
              { label: 'Instagram', value: 'instagram' },
              { label: 'TikTok', value: 'tiktok' },
              { label: 'Facebook', value: 'facebook' },
            ],
          },
          {
            type: 'string',
            label: 'Link al post',
            name: 'postUrl',
            description:
              'Scegli prima la piattaforma, poi incolla il link al post o video. Il sito estrae automaticamente l\'ID.',
            required: true,
            ui: {
              validate: (value: any, values: any) => {
                if (!value) {
                  return 'Il link è obbligatorio';
                }
                if (!/^https?:\/\//i.test(value)) {
                  return 'Inserisci un link completo (https://...)';
                }

                const platform = String(values?.platform ?? 'instagram').toLowerCase();

                if (platform === 'instagram' && !/instagram\.com\/(p|reel|tv)\//i.test(value)) {
                  return 'Per Instagram usa un link del tipo https://www.instagram.com/p/... oppure /reel/...';
                }

                if (platform === 'tiktok' && !/tiktok\.com\/@[^/]+\/video\/\d+/i.test(value)) {
                  return 'Per TikTok usa un link del tipo https://www.tiktok.com/@username/video/123456789';
                }

                if (platform === 'facebook' && !/facebook\.com\//i.test(value)) {
                  return 'Per Facebook usa un link del tipo https://www.facebook.com/...';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'Titolo',
            name: 'title',
            description: 'Nome breve della scheda (opzionale)',
          },
          {
            type: 'string',
            label: 'Didascalia',
            name: 'caption',
            description: 'Breve didascalia della scheda (opzionale)',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'number',
            label: 'Ordine di visualizzazione',
            name: 'order',
            description: 'Ordinamento crescente',
          },
          {
            type: 'boolean',
            label: 'Attivo',
            name: 'isActive',
            description: 'Mostrare il post sulla pagina',
            ui: { defaultValue: true },
          },
        ],
      },
      /**
       * Collezione "Impostazioni social"
       * Sincronizzata con src/content/settings/
       */
      {
        label: 'Impostazioni social',
        name: 'settings',
        path: 'src/content/settings',
        format: 'json',
        ui: {
          allowedActions: {
            create: true,
            delete: false,
          },
          filename: {
            readonly: true,
            slugify: () => 'social',
          },
        },
        fields: [
          {
            type: 'string',
            label: 'URL profilo Instagram',
            name: 'instagramProfileUrl',
            description: 'Esempio: https://www.instagram.com/browarchitect.studio/',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value) {
                  return 'Il link è obbligatorio';
                }
                if (!/^https?:\/\//i.test(value)) {
                  return 'Inserisci un link completo (https://...)';
                }
                if (!/instagram\.com\//i.test(value)) {
                  return 'Il link deve portare a Instagram';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'Instagram username',
            name: 'instagramUsername',
            description: 'Senza il simbolo @ (esempio: browarchitect.studio)',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value) {
                  return 'Lo username è obbligatorio';
                }
                if (String(value).startsWith('@')) {
                  return 'Inserisci lo username senza @';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'URL profilo TikTok',
            name: 'tiktokProfileUrl',
            description: 'Esempio: https://www.tiktok.com/@your_username',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value) {
                  return 'Il link è obbligatorio';
                }
                if (!/^https?:\/\//i.test(value)) {
                  return 'Inserisci un link completo (https://...)';
                }
                if (!/tiktok\.com\//i.test(value)) {
                  return 'Il link deve portare a TikTok';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'TikTok username',
            name: 'tiktokUsername',
            description: 'Senza il simbolo @ (esempio: browarchitect)',
            required: true,
            ui: {
              validate: (value: any) => {
                if (!value) {
                  return 'Lo username è obbligatorio';
                }
                if (String(value).startsWith('@')) {
                  return 'Inserisci lo username senza @';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'URL pagina Facebook',
            name: 'facebookPageUrl',
            description: 'Esempio: https://www.facebook.com/yourpage',
            ui: {
              validate: (value: any) => {
                if (value && !/^https?:\/\//i.test(value)) {
                  return 'Inserisci un link completo (https://...)';
                }
                if (value && !/facebook\.com\//i.test(value)) {
                  return 'Il link deve portare a Facebook';
                }
              },
            },
          },
          {
            type: 'string',
            label: 'Nome pagina Facebook',
            name: 'facebookPageName',
            description: 'Esempio: Brow & Lip Studio',
          },
          {
            type: 'boolean',
            label: 'Mostra blocco pagina Facebook',
            name: 'facebookShowPageEmbed',
            description: 'Se disattivato, nella pagina restano solo i singoli post Facebook',
            ui: { defaultValue: false },
          },
        ],
      },
    ],
  },
});
