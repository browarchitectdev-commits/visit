import { defineCollection, z } from 'astro:content';

const servicesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string()
      .min(3, 'Il nome deve contenere almeno 3 caratteri')
      .max(100, 'Il nome è troppo lungo'),
    price: z.number()
      .positive('Il prezzo deve essere un numero positivo')
      .int('Il prezzo deve essere un numero intero'),
    duration: z.number()
      .positive('La durata deve essere positiva')
      .int('La durata deve essere un numero intero'),
    description: z.string()
      .min(20, 'La descrizione deve essere informativa')
      .max(1000, 'La descrizione è troppo lunga'),
    image: z.string().min(1, 'Inserisci un immagine'),
    order: z.number().int().optional(),
    isActive: z.boolean().default(true),
  }),
});

const galleryCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string()
      .min(3, 'Il titolo deve contenere almeno 3 caratteri')
      .max(150, 'Il titolo è troppo lungo'),
    category: z.enum(['brouws', 'lips', 'eyeliner', 'nails', 'face', 'other'], {
      errorMap: () => ({ message: 'Scegli una categoria' }),
    }),
    description: z.string()
      .min(10, 'La descrizione deve essere informativa')
      .max(1000, 'La descrizione è troppo lunga'),
    imageBefore: z.string().min(1, 'Inserisci la foto prima'),
    imageAfter: z.string().min(1, 'Inserisci la foto dopo'),
    date: z.coerce.date().optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().default(true),
  }),
});

const socialCollection = defineCollection({
  type: 'data',
  schema: z.object({
    platform: z.enum(['instagram', 'tiktok', 'facebook']).default('instagram'),
    postUrl: z.string().url('Inserisci un link valido al post'),
    title: z.string().max(120, 'Titolo troppo lungo').optional(),
    caption: z.string().max(280, 'Didascalia troppo lunga').optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().default(true),
  }),
});

const settingsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    instagramProfileUrl: z.string().url('Inserisci un link valido al profilo Instagram'),
    instagramUsername: z.string().min(1, 'Inserisci lo username senza @'),
    tiktokProfileUrl: z.string().url('Inserisci un link valido al profilo TikTok'),
    tiktokUsername: z.string().min(1, 'Inserisci lo username TikTok senza @'),
    facebookPageUrl: z.string().url('Inserisci un link valido alla pagina Facebook').optional(),
    facebookPageName: z.string().min(1, 'Inserisci il nome della pagina Facebook').optional(),
    facebookShowPageEmbed: z.boolean().default(false),
  }),
});

export const collections = {
  services: servicesCollection,
  gallery: galleryCollection,
  social: socialCollection,
  settings: settingsCollection,
};
