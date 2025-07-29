# [svelte-web-android-nodejs](https://github.com/TeemuKoivisto/svelte-web-android-nodejs)

## Oauth

[Github](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

In short:

1. Go to https://github.com/settings/developers
2. Select **OAuth Apps**
3. Click **New Oauth App**
4. Set as **Application name** eg `myapp-localhost`, as you can only use single URL per app. (Create prod version separately)
5. Set as **Homepage URL** http://localhost:5180
6. Set as **Authorization callback URL** http://localhost:5180/callbacks/github
7. Copy **Client ID** as `GITHUB_OAUTH_CLIENT_ID` for `packages/api/.env`
8. Click **Generate a new client secret** and set it as `GITHUB_OAUTH_CLIENT_SECRET`
9. You should be able to login with GitHub!
