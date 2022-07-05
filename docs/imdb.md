<!-- markdownlint-disable MD033 -->

# Tutorial: IMDb

This guide uses an example API for IMDb (the International Movie Database) that introduces you to using Fern. We'll generate a TypeScript server and a Postman Collection to implement and test our API.

## Step 0: Prerequisites

- Install [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- Install [Postman](https://www.postman.com/downloads/)

## Step 1: Set up

Create a new folder for this tutorial and `cd` into it. Let's create a new npm project.

```bash
npm init -y
npm install typescript ts-node express @types/express
```

This will set us up for a new TypeScript backend repo. We'll also install fern:

```bash
npm install -g fern-api
```

## Step 2: Initialize

In the root of your backend repo, run:

```bash
fern init
```

<br>
<details>
<summary>What happens:</summary>

This adds the following content:

```yml
api/
├── src
│   ├── api.yml
└── .fernrc.yml
fern.config.json
```

- [`api.yml`](definition.md#an-example-of-a-fern-api-definition) is an example Fern API Definition for IMDb.
- [`.fernrc.yml`](fernrc.md) is a configuration file local to a single API in your repo.
- [`fern.config.json`](fern-config-json.md) is a configuration file that applies to all APIs in your repo.

</details>

## Step 3: Add generators

```bash
fern add typescript
fern add postman
```

<br>
<details>
<summary>What happens:</summary>

`.fernrc.yml` will now list two generators:

```diff
 name: api
 definition: src
-generators: []
+generators:
+  - name: fernapi/fern-typescript
+    version: 0.0.101
+    generate: true
+    config:
+      mode: server
+  - name: fernapi/fern-postman
+    version: 0.0.6
+    generate:
+      enabled: true
+      output: ./generated-postman.json
```

</details>

## Step 4: Run generators

```bash
fern generate
```

In terminal, you'll see `Published @imdb-fern/api-server@x.x.x` which we'll add as a dependency.

```bash
npm config set --location project @imdb-fern:registry https://npm-dev.buildwithfern.com/
npm install @imdb-fern/api-server@x.x.x
```

In your files, you'll also see a `generated-postman.json` that we'll import to Postman later.

## Step 5: Implement the server

We'll create a new file `server.ts` in the root of our project. This will be a simple express server that servers our IMDb API.

```ts
// server.ts
import { GetMovieErrorBody, MovieId } from "@imdb-fern/api-server/model";
import { MoviesService } from "@imdb-fern/api-server/services";
import express from "express";

const app = express();

app.use(
  MoviesService.expressMiddleware({
    // TODO
  })
);

console.log("Listening on port 8080!");
app.listen(8080);
```

Our IDE will give us red lines indicating that we need to add missing properties.

![server.ts error message](assets/tutorial/server.ts%20error%20message.png)

You can implement the missing methods, for example:

```diff
 // server.ts
 import express from "express";
 const app = express();

 app.use(MoviesService.expressMiddleware({
+  createMovie: (request) => {
+    console.log(request);
+    return {
+      ok: true,
+      body: MovieId.of("iron-man-3")
+    }
+  },

+  getMovie: () => {
+    return {
+      ok: false,
+      error: GetMovieErrorBody.NotFoundError()
+    }
+  }
 }))

 console.log("Listening on port 8080!");
 app.listen(8080);
```

## Step 6: Run the server

```bash
./node_modules/.bin/ts-node server.ts
```

## Step 7: Hit the server from Postman

Open Postman and File -> Import `api/generated-postman.json` that we generated in Step 4.

Select the `createMovie` endpoint and hit `Send`. You should get a response back from your server **`iron-man-3`**.

![postman-testing](assets/tutorial/postman-testing.png)

## Step 8: Celebrate

You've successfully implemented a simple IMDb server using Fern. You're invited to join our [Discord](https://discord.gg/JkkXumPzcG).
