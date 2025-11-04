export type Ok<T> = {
  data: T
}
export type Err = {
  err: string
  code: number
  cause?: string
  stack?: string
}
// Based on Rust's Result https://doc.rust-lang.org/std/result/
export type Result<T = unknown> = Ok<T> | Err
