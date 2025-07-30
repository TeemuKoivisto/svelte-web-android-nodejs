import * as z from 'zod'
import { derived, writable } from 'svelte/store'
import { TaskStatusSchema, STORE_TASK, type StoreTask } from '@org/lib/schemas'

import { tasksApi, api } from '$api/request'
import { persistedMap } from './persist'

export const tasksMap = persistedMap(writable(new Map<string, StoreTask>()), {
  key: 'tasks-map',
  parse: STORE_TASK.safeParse
})
export const tasksList = derived(tasksMap, m => Array.from(m.values()))

type TaskStore = typeof tasksApi & {}

export const taskStore: TaskStore = {
  list: async () => {
    const res = await api('GET /api/tasks')
    // const res = await tasksApi.list()
    if ('data' in res) {
      tasksMap.merge(res.data)
    }
    return res
  },
  create: async values => {
    const res = await api('POST /api/tasks', { body: values })
    // const res = await tasksApi.create(values)
    if ('data' in res) {
      tasksMap.merge([res.data])
    }
    return res
  },
  delete: async id => {
    const res = await api('DELETE /api/tasks/{taskId}', {
      taskId: id
    })
    // const res = await tasksApi.delete(id)
    if ('data' in res || res.code === 404) {
      tasksMap.remove(id)
    }
    return res
  },
  update: async (id, values) => {
    const res = await api('PATCH /api/tasks/{taskId}', {
      taskId: id,
      body: values
    })
    // const res = await tasksApi.update(id, values)
    if ('data' in res) {
      tasksMap.merge([{ id, ...values }])
    }
    return res
  }
}
