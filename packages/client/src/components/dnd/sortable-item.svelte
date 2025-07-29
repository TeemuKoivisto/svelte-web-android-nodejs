<script lang="ts">
  import type { UniqueIdentifier } from '@dnd-kit-svelte/core'
  import { CSS, styleObjectToString } from '@dnd-kit-svelte/utilities'
  import { useSortable } from '@dnd-kit-svelte/sortable'

  interface Task {
    id: UniqueIdentifier
    content: string
  }

  let { task }: { task: Task } = $props()

  const { attributes, listeners, node, transform, transition, isDragging, isSorting } = useSortable(
    {
      id: task.id
    }
  )

  const style = $derived(
    styleObjectToString({
      transform: CSS.Transform.toString(transform.current),
      transition: isSorting.current ? transition.current : undefined,
      zIndex: isDragging.current ? 1 : undefined
    })
  )
</script>

<div
  class="relative select-none"
  bind:this={node.current}
  {style}
  {...listeners.current}
  {...attributes.current}
>
  <!-- Original element - becomes invisible during drag but maintains dimensions -->
  <div class={['rd-18px bg-white p-4', { invisible: isDragging.current }]}>
    {task.content}
  </div>

  <!-- Drag placeholder - set to match original dimensions -->
  {#if isDragging.current}
    <div class="abs inset-0 flex items-center justify-center">
      <!-- You can put any content here for the dragging state -->
      <div
        class="bg-orange/10 rd-18px b-2 b-orange b-dashed flex h-full w-full items-center justify-center"
      >
        <span class="text-orange">Moving: {task.content}</span>
      </div>
    </div>
  {/if}
</div>
