import z from 'zod'

export const CONFIG = z.object({
  API_URL: z.string().url()
})

export const API_URL = z
  .string()
  .url()
  .parse(import.meta.env.VITE_API_URL)
