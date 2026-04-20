export type ApiResp<T = unknown> = {
  code: number
  message: string
  data: T
}
