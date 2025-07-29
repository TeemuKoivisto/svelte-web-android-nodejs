<script lang="ts">
  import { onMount } from 'svelte'

  import SortableList from '$components/dnd/sortable-list.svelte'

  import { taskStore } from '$stores/task-store'

  onMount(() => {
    taskStore.list()
  })
</script>

<section class="xs:p-8 container mx-auto rounded-2xl p-4 md:p-16 md:pt-8">
  <h1 class="my-3 flex items-center text-5xl font-bold">Tasks</h1>
  <SortableList />
</section>

<style lang="postcss">
  @reference "#app.css";
</style>
