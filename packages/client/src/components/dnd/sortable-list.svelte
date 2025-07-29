<script lang="ts">
  import Icon from '@iconify/svelte/dist/OfflineIcon.svelte'
  import plus from '@iconify-icons/mdi/plus'
  import { crossfade } from 'svelte/transition'
  import {
    DndContext,
    DragOverlay,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent
  } from '@dnd-kit-svelte/core'
  import { SortableContext, arrayMove } from '@dnd-kit-svelte/sortable'

  import Droppable from './droppable.svelte'
  import SortableItem from './sortable-item.svelte'
  import { dropAnimation, sensors } from './dnd-utils'

  import { tasksMap, taskStore } from '$stores/task-store'
  import { TaskStatusSchema, type StoreTask, type TaskStatusType } from '@org/lib/schemas'

  let tasks = $state<StoreTask[]>([])
  let activeId = $state<string | null>(null)

  const activeTask = $derived(tasks.find(t => t.id === activeId))
  const backlog = $derived(tasks.filter(t => t.status === 'BACKLOG'))
  const todos = $derived(tasks.filter(t => t.status === 'TODO'))
  const inprogress = $derived(tasks.filter(t => t.status === 'IN_PROGRESS'))
  const blocked = $derived(tasks.filter(t => t.status === 'BLOCKED'))
  const done = $derived(tasks.filter(t => t.status === 'DONE'))

  tasksMap.subscribe(map => {
    tasks = Array.from(map.values())
  })

  function handleDragStart(event: DragStartEvent) {
    activeId = event.active.id as string
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || !activeId) return

    // console.log('dropped to', over)
    let overStatus: TaskStatusType | undefined
    try {
      overStatus = TaskStatusSchema.parse(over.id)
    } catch (err) {}
    if (overStatus) {
      const found = tasks.find(todo => todo.id === active.id)
      if (found) {
        found.status = overStatus
        taskStore.update(activeId, {
          status: overStatus
        })
      }
      return
    }

    const overTask = $state.snapshot(tasks.find(todo => todo.id === over?.id))
    if (!overTask || activeId === overTask.id) return

    const oldIndex = tasks.findIndex(task => task.id === active.id)
    const newIndex = tasks.findIndex(task => task.id === over.id)
    const activeTask = tasks[oldIndex]
    tasks = arrayMove(tasks, oldIndex, newIndex)

    // @TODO save new order to db
    const old = $tasksMap.get(activeId)
    if (old?.status !== activeTask.status) {
      taskStore.update(activeTask.id, {
        status: activeTask.status
      })
    }
    activeId = null
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return

    const activeTask = tasks.find(todo => todo.id === active.id)
    if (!activeTask) return

    // Handle container drag-over
    if (over.id === 'done' || over.id === 'in-progress') {
      activeTask.status = over.id as TaskStatusType
      return
    }

    // Handle item drag-over
    const overTask = tasks.find(todo => todo.id === over.id)
    if (!overTask) return

    // Update the active task's done status to match the container it's being dragged over
    activeTask.status = overTask.status
  }

  const [send, recieve] = crossfade({ duration: 100 })

  function createTask(status: TaskStatusType) {
    taskStore.create({
      status,
      title: 'untitled'
    })
  }
</script>

<DndContext
  {sensors}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  onDragOver={handleDragOver}
>
  <div class="grid gap-4 md:grid-cols-2">
    {@render taskList('BACKLOG', 'Backlog', backlog)}
    {@render taskList('TODO', 'Todo', todos)}
    {@render taskList('IN_PROGRESS', 'In Progress', inprogress)}
    {@render taskList('BLOCKED', 'Blocked', blocked)}
    {@render taskList('DONE', 'Done', done)}
  </div>

  <DragOverlay {dropAnimation}>
    {#if activeTask && activeId}
      <SortableItem task={activeTask} />
    {/if}
  </DragOverlay>
</DndContext>

{#snippet taskList(id: TaskStatusType, title: string, tasks: StoreTask[])}
  <SortableContext items={tasks}>
    <div class="rd-3xl flex flex-col bg-gray-100 pt-3">
      <Droppable class="flex-grow p-2 pb-0" {id}>
        <p class="fw-bold ml-3 pb-3 text-lg">{title}</p>
        <div class="grid gap-2">
          {#each tasks as task (task.id)}
            <div class="" in:recieve={{ key: task.id }} out:send={{ key: task.id }}>
              <SortableItem {task} />
            </div>
          {/each}
        </div>
      </Droppable>
      <div class="mr-2 group-hover:visible">
        <button
          class="m-2 flex cursor-pointer items-center justify-between rounded-md px-2 py-1 pr-4 text-sm font-medium hover:bg-gray-200"
          onclick={() => createTask(id)}
        >
          <Icon icon={plus} width={16} height={16} />
          <span class="ml-2">New task</span>
        </button>
      </div>
    </div>
  </SortableContext>
{/snippet}
