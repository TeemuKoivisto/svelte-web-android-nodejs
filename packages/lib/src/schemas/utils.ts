import { DateTime } from 'luxon'
import { z } from 'zod'

export const zAnyDateTime = z.any().transform((val, ctx) => {
  let dt
  if (val instanceof DateTime) {
    dt = val
  } else if (typeof val === 'string') {
    dt = DateTime.fromISO(val)
    if (!dt.isValid) {
      // Docker timestamps are somehow weirdly formed like this "2025-06-10 10:38:27 +0000 UTC"
      // Which JS Date parses but not Luxon
      dt = DateTime.fromJSDate(new Date(val))
    }
  } else if (val instanceof Date) {
    dt = DateTime.fromJSDate(val)
  } else {
    dt = DateTime.fromJSDate(new Date(val))
  }
  if (!dt.isValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Not a valid date'
    })
    return z.NEVER
  }
  return dt
})
export const zJSON = z.any().transform((val, ctx) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val)
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${val} is not valid JSON`
      })
      return z.NEVER
    }
  } else if (!val || typeof val !== 'object') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${val} was not a valid object`
    })
    return z.NEVER
  }
  return val
})
