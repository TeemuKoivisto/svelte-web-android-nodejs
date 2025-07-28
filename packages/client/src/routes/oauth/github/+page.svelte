<script lang="ts">
  import { onMount } from 'svelte'

  import { authStore } from '$stores/auth-store'

  onMount(async () => {
    const resp = await authStore.githubCallback()
    if ('err' in resp) {
      console.error(resp)
    }
  })
</script>
