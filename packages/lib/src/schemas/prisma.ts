import { z } from 'zod'
import { Prisma } from '@/db'

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput =
  | Prisma.JsonValue
  | null
  | 'JsonNull'
  | 'DbNull'
  | Prisma.NullTypes.DbNull
  | Prisma.NullTypes.JsonNull

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull
  if (v === 'JsonNull') return Prisma.JsonNull
  return v
}

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema))
  ])
)

export type JsonValueType = z.infer<typeof JsonValueSchema>

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform(v => transformJsonNull(v))

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.function(z.tuple([]), z.any()) }),
    z.record(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)])))
  ])
)

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum([
  'ReadUncommitted',
  'ReadCommitted',
  'RepeatableRead',
  'Serializable'
])

export const AccountScalarFieldEnumSchema = z.enum([
  'id',
  'type',
  'provider',
  'providerAccountId',
  'refresh_token',
  'access_token',
  'expires_at',
  'token_type',
  'scope',
  'id_token',
  'session_state',
  'created_at',
  'updated_at',
  'user_id'
])

export const SessionScalarFieldEnumSchema = z.enum(['id', 'sessionToken', 'expires', 'user_id'])

export const UserScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'email',
  'emailVerified',
  'image',
  'status',
  'settings',
  'created_at',
  'updated_at'
])

export const SortOrderSchema = z.enum(['asc', 'desc'])

export const JsonNullValueInputSchema = z
  .enum(['JsonNull'])
  .transform(value => (value === 'JsonNull' ? Prisma.JsonNull : value))

export const QueryModeSchema = z.enum(['default', 'insensitive'])

export const NullsOrderSchema = z.enum(['first', 'last'])

export const JsonNullValueFilterSchema = z
  .enum(['DbNull', 'JsonNull', 'AnyNull'])
  .transform(value =>
    value === 'JsonNull'
      ? Prisma.JsonNull
      : value === 'DbNull'
        ? Prisma.JsonNull
        : value === 'AnyNull'
          ? Prisma.AnyNull
          : value
  )

export const UserStatusSchema = z.enum(['DISABLED', 'ACTIVE'])

export type UserStatusType = `${z.infer<typeof UserStatusSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const AccountSchema = z.object({
  id: z.string().cuid(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().nullable(),
  access_token: z.string().nullable(),
  expires_at: z.number().int().nullable(),
  token_type: z.string().nullable(),
  scope: z.string().nullable(),
  id_token: z.string().nullable(),
  session_state: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  user_id: z.string()
})

export type Account = z.infer<typeof AccountSchema>

// ACCOUNT RELATION SCHEMA
//------------------------------------------------------

export type AccountRelations = {
  user: UserWithRelations
}

export type AccountWithRelations = z.infer<typeof AccountSchema> & AccountRelations

export const AccountWithRelationsSchema: z.ZodType<AccountWithRelations> = AccountSchema.merge(
  z.object({
    user: z.lazy(() => UserWithRelationsSchema)
  })
)

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  id: z.string().cuid(),
  sessionToken: z.string(),
  expires: z.coerce.date(),
  user_id: z.string()
})

export type SessionDB = z.infer<typeof SessionSchema>

// SESSION RELATION SCHEMA
//------------------------------------------------------

export type SessionRelations = {
  user: UserWithRelations
}

export type SessionWithRelations = z.infer<typeof SessionSchema> & SessionRelations

export const SessionWithRelationsSchema: z.ZodType<SessionWithRelations> = SessionSchema.merge(
  z.object({
    user: z.lazy(() => UserWithRelationsSchema)
  })
)

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  status: UserStatusSchema,
  id: z.string().cuid(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.coerce.date().nullable(),
  image: z.string().nullable(),
  settings: JsonValueSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
})

export type User = z.infer<typeof UserSchema>

// USER RELATION SCHEMA
//------------------------------------------------------

export type UserRelations = {
  accounts: AccountWithRelations[]
  sessions: SessionWithRelations[]
}

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> = UserSchema.merge(
  z.object({
    accounts: z.lazy(() => AccountWithRelationsSchema).array(),
    sessions: z.lazy(() => SessionWithRelationsSchema).array()
  })
)

/////////////////////////////////////////
