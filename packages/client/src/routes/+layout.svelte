<script lang="ts">
  // import Modal from '$modals/Modal.svelte'
  import Navbar from '$components/Navbar.svelte'
  import { Toaster } from '$shadcn/ui/sonner'

  import type { Snippet } from 'svelte'

  import '../app.css'

  interface Props {
    children: Snippet<[]>
  }

  let { children }: Props = $props()
</script>

<div class="flex-col items-center">
  <Navbar />
  <main class="mx-[auto] flex h-full min-h-[calc(100vh-64px)] max-w-[860px] flex-col items-center">
    {@render children()}
  </main>
</div>

<!-- <Modal /> -->
<Toaster />
