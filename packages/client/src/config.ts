import z from 'zod'

export const CONFIG = z.object({
  API_URL: z.string().url()
})

export const API_URL = ''
