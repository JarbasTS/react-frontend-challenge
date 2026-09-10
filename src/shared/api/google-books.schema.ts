import { z } from 'zod';

const volumeInfoSchema = z.object({
  title: z.string().default('Título desconhecido'),
  authors: z.array(z.string()).optional(),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  description: z.string().optional(),
  imageLinks: z
    .object({
      thumbnail: z.string().optional(),
      smallThumbnail: z.string().optional(),
    })
    .optional(),
  previewLink: z.string().optional(),
  printType: z.string().optional(),
  pageCount: z.number().optional(),
  categories: z.array(z.string()).optional(),
});

export const volumeSchema = z.object({
  id: z.string(),
  volumeInfo: volumeInfoSchema,
});

export const searchResponseSchema = z.object({
  totalItems: z.number(),
  // A Google Books API omite `items` quando totalItems é 0.
  items: z.array(volumeSchema).optional(),
});

export type GoogleVolume = z.infer<typeof volumeSchema>;
export type GoogleSearchResponse = z.infer<typeof searchResponseSchema>;
