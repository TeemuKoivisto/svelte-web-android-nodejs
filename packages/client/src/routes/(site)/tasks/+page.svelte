<script lang="ts">
  import { tasksList, taskStore } from '$stores/task-store'
  import { onMount } from 'svelte'

  onMount(() => {
    taskStore.list()
  })
</script>

<section class="xs:p-8 container mx-auto rounded-2xl p-4 md:p-16 md:pt-8">
  <h1 class="my-3 flex items-center text-5xl font-bold">Tasks</h1>

  <ul class="pl-1">
    {#each $tasksList as task}
      <li>{task.title}</li>
    {/each}
  </ul>
</section>

<style lang="postcss">
  @reference "#app.css";
</style>
