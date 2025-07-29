import { z } from 'zod'

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
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

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>

export const InputJsonValueSchema: z.ZodType<InputJsonValue> = z.lazy(() =>
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

export const TaskScalarFieldEnumSchema = z.enum([
  'id',
  'title',
  'content',
  'status',
  'created_at',
  'updated_at',
  'archived_at',
  'trashed_at',
  'user_id'
])

export const SortOrderSchema = z.enum(['asc', 'desc'])

export const QueryModeSchema = z.enum(['default', 'insensitive'])

export const NullsOrderSchema = z.enum(['first', 'last'])

export const UserStatusSchema = z.enum(['DISABLED', 'ACTIVE'])

export type UserStatusType = `${z.infer<typeof UserStatusSchema>}`

export const TaskStatusSchema = z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'])

export type TaskStatusType = `${z.infer<typeof TaskStatusSchema>}`

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
  tasks: TaskWithRelations[]
}

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> = UserSchema.merge(
  z.object({
    accounts: z.lazy(() => AccountWithRelationsSchema).array(),
    sessions: z.lazy(() => SessionWithRelationsSchema).array(),
    tasks: z.lazy(() => TaskWithRelationsSchema).array()
  })
)

/////////////////////////////////////////
// TASK SCHEMA
/////////////////////////////////////////

export const TaskSchema = z.object({
  status: TaskStatusSchema,
  id: z.string().cuid(),
  title: z.string(),
  content: JsonValueSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  archived_at: z.coerce.date().nullable(),
  trashed_at: z.coerce.date().nullable(),
  user_id: z.string()
})

export type Task = z.infer<typeof TaskSchema>

// TASK RELATION SCHEMA
//------------------------------------------------------

export type TaskRelations = {
  user: UserWithRelations
}

export type TaskWithRelations = z.infer<typeof TaskSchema> & TaskRelations

export const TaskWithRelationsSchema: z.ZodType<TaskWithRelations> = TaskSchema.merge(
  z.object({
    user: z.lazy(() => UserWithRelationsSchema)
  })
)

/////////////////////////////////////////

// Generated with "prisma": "^6.12.0",
/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches a JSON object.
 * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from.
 */
export declare type JsonObject = {
  [Key in string]?: JsonValue
}
/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches a JSON array.
 */
export declare interface JsonArray extends Array<JsonValue> {}
/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches any valid JSON value.
 */
export declare type JsonValue = string | number | boolean | JsonObject | JsonArray | null

/**
 * Matches a JSON object.
 * Unlike \`JsonObject\`, this type allows undefined and read-only properties.
 */
export declare type InputJsonObject = {
  readonly [Key in string]?: InputJsonValue | null
}
/**
 * Matches any valid value that can be used as an input for operations like
 * create and update as the value of a JSON field. Unlike \`JsonValue\`, this
 * type allows read-only arrays and read-only object properties and disallows
 * \`null\` at the top level.
 *
 * \`null\` cannot be used as the value of a JSON field because its meaning
 * would be ambiguous. Use \`Prisma.JsonNull\` to store the JSON null value or
 * \`Prisma.DbNull\` to clear the JSON value and set the field to the database
 * NULL value instead.
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
 */
export declare type InputJsonValue =
  | string
  | number
  | boolean
  | InputJsonObject
  | InputJsonArray
  | {
      toJSON(): unknown
    }
/**
 * Matches a JSON array.
 * Unlike \`JsonArray\`, readonly arrays are assignable to this type.
 */
export declare interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}
