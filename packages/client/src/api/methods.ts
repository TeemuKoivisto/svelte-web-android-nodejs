import { type Result, wrappedFetch } from '@/lib'

// import {API_URL} from '$config'

const API_URL = ''

export const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
}

export const get = <T>(
  path: string,
  parse?: (data: any) => T,
  headers: Record<string, string> = DEFAULT_HEADERS
): Promise<Result<T>> =>
  wrappedFetch<any>(`${API_URL}/${path}`, {
    method: 'GET',
    headers
  }).then(resp => ('data' in resp && parse ? { data: parse(resp.data) } : resp))

export const patch = <T>(
  path: string,
  payload: any,
  parse?: (data: any) => T,
  headers: Record<string, string> = DEFAULT_HEADERS
): Promise<Result<T>> =>
  wrappedFetch<any>(`${API_URL}/${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload)
  }).then(resp => ('data' in resp && parse ? { data: parse(resp.data) } : resp))

export const post = <T>(
  path: string,
  payload: any,
  parse?: (data: any) => T,
  headers: Record<string, string> = DEFAULT_HEADERS
): Promise<Result<T>> =>
  wrappedFetch<any>(`${API_URL}/${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  }).then(resp => ('data' in resp && parse ? { data: parse(resp.data) } : resp))

export const del = <T>(
  path: string,
  parse?: (data: any) => T,
  headers: Record<string, string> = DEFAULT_HEADERS
): Promise<Result<T>> =>
  wrappedFetch<any>(`${API_URL}/${path}`, {
    method: 'DELETE',
    headers
  }).then(resp => ('data' in resp && parse ? { data: parse(resp.data) } : resp))
