<script lang="ts">
  import * as DropdownMenu from '$shadcn/ui/dropdown-menu/index.js'

  import { authStore, currentUser } from '$stores/auth-store'
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class="relative flex rounded-full bg-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
  >
    {#if $currentUser}
      <span class="absolute -inset-1.5"></span>
      <span class="sr-only">Open user menu</span>
      <img class="h-8 w-8 rounded-full" src={$currentUser.image || ''} alt="User avatar" />
    {:else}
      Sign in
    {/if}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-56">
    {#if $currentUser}
      <DropdownMenu.DropdownMenuItem>{$currentUser.name}</DropdownMenu.DropdownMenuItem>
      <DropdownMenu.Separator />
      <DropdownMenu.DropdownMenuItem>Settings</DropdownMenu.DropdownMenuItem>
      <DropdownMenu.DropdownMenuItem onclick={authStore.logout}>
        Sign out
      </DropdownMenu.DropdownMenuItem>
    {:else}
      <DropdownMenu.DropdownMenuItem class="p-0">
        <a
          class="flex h-full w-full items-center px-2 py-1.5"
          href={`http://localhost:5181/oauth/github/login?redirect_uri=${location.origin}/oauth/github?redirect=${location.pathname}`}
        >
          <img class="mr-3 h-[16px]" src="github-icon.svg" alt="Github logo" />
          GitHub
        </a>
      </DropdownMenu.DropdownMenuItem>
      <DropdownMenu.DropdownMenuItem>
        <img
          class="mr-3 h-[16px]"
          src="google-logo.svg"
          alt="Google logo"
        />Google</DropdownMenu.DropdownMenuItem
      >
    {/if}
  </DropdownMenu.Content>
</DropdownMenu.Root>
