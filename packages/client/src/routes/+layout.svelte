<script lang="ts">
  // import Modal from '$modals/Modal.svelte'
  import type { Snippet } from 'svelte'

  import '../app.css'

  interface Props {
    children: Snippet<[]>
  }

  let { children, ...rest }: Props = $props()
</script>

<main>
  {@render children()}
</main>
<!-- <Modal /> -->
