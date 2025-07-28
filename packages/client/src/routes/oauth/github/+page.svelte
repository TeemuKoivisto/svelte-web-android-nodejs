<script lang="ts">
  import { onMount } from 'svelte'

  import { authActions } from '$stores/auth-store'

  onMount(async () => {
    const resp = await authActions.githubCallback()
    if ('err' in resp) {
      console.error(resp)
    }
  })
</script>
