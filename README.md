# [svelte-web-android-nodejs](https://github.com/TeemuKoivisto/svelte-web-android-nodejs)

**My current SvelteKit boilerplate as of 2025.**

1. Static SvelteKit client so that I can deploy it to easily to CDN or as CapacitorJS webview to Android.
2. NodeJS API with SvelteKit but it can be easily switched to eg. Cloudflare.
3. For UI, I'm using Tailwind 4 and shadcn so I don't have to reinvent every component.
4. Postgres with Prisma and Supabase
5. zod with generated schemas directly from Prisma for that sweet type-safety. Only issue is using Luxon for dates which makes sharing same schema between server & client harder.
6. No Terraform stacks yet but it's pretty standard Ansible + Terraform + Hetzner setup.

This should suffice for any hobby project with minimal hosting costs, the most likely first bottle-neck would be managing multiple deployments of the API server. You can do that with eg. k3s, ECS or switching to Cloudflare adapter (although directly connecting to Postgres from Cloudflare workers could be inefficient).

_Also_ Prisma client doesn't work directly with Cloudflare workers as they want you to buy Prisma Accelarate. If you don't care for that, you'll have to write the queries with different postgres client or switch to another ORM eg. Drizzle.

I'll try keeping this updated.

## How to run

You need NodeJS >= 20, pnpm >= 10, Docker & Docker Compose installed.

1. Copy/edit .envs: `cp ./packages/db/.env-example ./packages/db/.env cp ./packages/api/.env-example ./packages/api/.env`
2. Generate JWT_SECRET for API `.env`: `openssl rand -base64 32`
3. Start postgres: `docker-compose up -d postgres`
4. Install deps: `pnpm i`
5. Build lib: `pnpm lib`
6. Migrate & seed db: `pnpm --filter db migrate && pnpm --filter db seed`
7. Start API: `pnpm api`
8. Start client: `pnpm client`
9. Site should open at http://localhost:5180/

## Oauth

[Github](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

1. Go to https://github.com/settings/developers
2. Select **OAuth Apps**
3. Click **New Oauth App**
4. Set as **Application name** eg `myapp-localhost`, as you can only use single URL per app. (Create prod version separately)
5. Set as **Homepage URL** http://localhost:5180
6. Set as **Authorization callback URL** http://localhost:5180/callbacks/github
7. Copy **Client ID** as `GITHUB_OAUTH_CLIENT_ID` for `packages/api/.env`
8. Click **Generate a new client secret** and set it as `GITHUB_OAUTH_CLIENT_SECRET` in `packages/api/.env`
9. Try logging in at http://localhost:5180 It should show GitHub Oauth prompt & redirect correctly
