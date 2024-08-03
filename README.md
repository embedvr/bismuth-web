# Bismuth Web

This is the repository for the web dashboard for the [Bismuth Minecraft plugin](https://github.com/embedvr/bismuth).

## How to use

Bismuth Web is built to run on Cloudflare Pages with a D1 database.

```bash
git clone https://github.com/embedvr/bismuth-web.git
cd bismuth-web
# edit the D1 bindings to your own,
# you can create your own with the following command
# pnpx wrangler d1 create [name]
nano wrangler.toml
pnpm run deploy
```

**Attention!** You will need to provide the environment variables listed inside the `.env.example` file to Cloudflare. You can do this either via the Cloudflare Dashboard or via `pnpx wrangler secret put [key]`.
**Double Attention!** For Bismuth to sucessfully talk to your web dashboard, you'll need HTTPS enabled on both the web dashboard and the Bismuth Minecraft API.
