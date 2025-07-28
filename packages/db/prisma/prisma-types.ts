// Generated with "prisma": "^6.12.0",
namespace Prisma {
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
}
