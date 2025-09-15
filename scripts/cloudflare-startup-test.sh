cd ..
mkdir cloudflare-test
cd cloudflare-test
cp -r ../fern/seed/ts-sdk/imdb/no-custom-config ./imdb
cd imdb
npm install
npm run build
npm install -g wrangler
yes | wrangler generate my-ts-worker
cp -r dist my-ts-worker/dist
cd my-ts-worker
echo '/**
* Welcome to Cloudflare Workers! This is your first worker.
*
* - Run `wrangler dev src/index.ts` in your terminal to start a development server
* - Open a browser tab at http://localhost:8787/ to see your worker in action
* - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
*
* Learn more at https://developers.cloudflare.com/workers/
*/

export interface Env {
// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
// MY_KV_NAMESPACE: KVNamespace;
//
// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
// MY_DURABLE_OBJECT: DurableObjectNamespace;
//
// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
// MY_BUCKET: R2Bucket;
//
// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
// MY_SERVICE: Fetcher;
}

import { SeedApiClient } from "../dist";

new SeedApiClient({ environment: "production" })
console.log("SeedApiClient import was successful");

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        return new Response("Hello World!");
    },
};' > src/index.ts
output=$(timeout 5s wrangler dev &)
echo "$output"
if echo "$output" | grep -q "SeedApiClient import was successful"; then
    echo "Compiled successfully"
else
    echo "Failed to compile"
    exit 1
fi
cd ../../..
rm -rf cloudflare-test
