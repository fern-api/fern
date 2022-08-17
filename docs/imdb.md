<!-- markdownlint-disable MD033 -->

# TypeScript Server Tutorial: IMDb

This guide uses an example API for IMDb (the International Movie Database) that introduces you to using Fern. We'll generate a TypeScript server and a Postman Collection to implement and test our API.

<a href="https://www.loom.com/share/c892f4a9fc674c4bb42fb31d395d9ebf">
    <p>Video walkthrough</p>
    <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/c892f4a9fc674c4bb42fb31d395d9ebf-1657127975624-with-play.gif">
  </a>

## Step 0: Prerequisites

- Install [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- Install [Postman](https://www.postman.com/downloads/)

## Step 1: Set up

Create a new folder for this tutorial and `cd` into it. Let's create a new npm project.

```bash
npm init -y
npm install typescript express @types/express ts-node
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

When it asks you for your `organization`, just write `imdb`.

In the `.fernrc.yml`, let's change the name of our api from `api` to `imdb-api`.

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

## Step 3: Add TypeScript generator

```bash
fern add typescript
```

<br>
<details>
<summary>What happens:</summary>

`.fernrc.yml` will now list a generator:

```diff
 name: api
 definition: src
-generators: []
+generators:
+  - name: fernapi/fern-typescript
+    version: 0.0.xxx
+    generate: true
+    config:
+      mode: client_and_server
```

</details>

## Step 4: Run the generator

```bash
fern generate
```

In the terminal, you'll see `Published @imdb-fern/imdb-api-server@0.0.x` which we'll add as a dependency. By default, Fern publishes dependencies to a private registry.

```bash
# Teach npm about the Fern private registry
npm config set --location project @imdb-fern:registry https://npm.buildwithfern.com/

# Your version may be different, but this version will also work
npm install @imdb-fern/imdb-api-server@0.0.1
```

## Step 5: Implement the server

We'll create a new file `server.ts` at the root of our project. This will be a simple express server that serves our IMDb API.

```ts
// server.ts
import { GetMovieErrorBody, MovieId } from "@imdb-fern/imdb-api-server/model";
import { MoviesService } from "@imdb-fern/imdb-api-server/services";
import express from "express";

const app = express();

app.use(
  MoviesService.expressMiddleware({
    createMovie: () => {
      return {
        ok: true,
        // We are hardcoding the movie "Iron Man 3" for this demo
        // because we don't have our server wired up to a database.
        body: MovieId.of("iron-man-3"),
      };
    },

    getMovie: () => {
      return {
        ok: false,
        error: GetMovieErrorBody.NotFoundError(),
      };
    },
  })
);

console.log("Listening for requests...");
app.listen(8080);
```

## Step 6: Run the server

```bash
npx ts-node server.ts
```

In the terminal, you should see `Listening for requests...`

## Step 7: Add the Postman generator

In another terminal, let's run:

```bash
fern add postman
fern generate
```

In the `api/` folder you'll see `generated-postman.json` that we'll import to Postman.

## Step 8: Hit the server from Postman

Open Postman and File -> Import `api/generated-postman.json`.

Select the `createMovie` endpoint and hit `Send`. You should get **`iron-man-3`** back from your server.

![createMovie-postman](../packages/docs/static/img/tutorial/createMovie-postman.png)

Select the `getMovie` endpoint and hit `Send`. As expected, we get a 404 response back.

![getMovie-postman](../packages/docs/static/img/tutorial/getMovie-postman.png)

## Step 9: Celebrate 🎉

You've successfully implemented a simple IMDb server using Fern. You're invited to join our [Discord](https://discord.gg/JkkXumPzcG).
