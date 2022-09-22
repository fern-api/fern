---
title: api.yml
---

`api.yml` is a file where you set configuration for your API. It contains the API name and authentication scheme.

## Name

In `api.yml` you must set the name of your API. This is used as the name of your API in generated SDKs.

### Example

```yaml title="/fern/api/definition/api.yml"
name: imdb-api
```

```ts
// using the generated TypeScript SDK
const imdb = new ImdbApi.Client();
```

## Authentication

In `api.yml` you can optionally set authentication for your API. Fern supports [bearer authentication](https://swagger.io/docs/specification/authentication/bearer-authentication/), [basic authentication](https://swagger.io/docs/specification/authentication/basic-authentication/), and authentication via HTTP headers.

::: tip
If you integrate Fern with your backend, it will check that the required authentication is present on every request. If a request is missing authentication, Fern will return a `401` for you.
:::

### No auth

If no authentication is required, leave it out:

```yaml title="/fern/api/definition/api.yml"
name: imdb-api
```

### Bearer authentication

If bearer authentication is required:

```yaml title="/fern/api/definition/api.yml"
name: imdb-api
auth: bearer
```

### Basic authentication

If basic authentication is required:

```yaml title="/fern/api/definition/api.yml"
name: imdb-api
auth: basic
```

### Authentication via HTTP headers

If authentication is required via headers, you must define custom auth-schemes:

```yaml title="/fern/api/definition/api.yml"
name: imdb-api
auth: api-key
auth-schemes:
  api-key:
    header: X-API-Key
    name: apiKey # Optional: friendly-name used in the SDKs
```

## Combining authentication schemes

You can define multiple auth schemes for your API.

### Allowing multiple authentication schemes

If multiple authentication schemes are allowed, but only one is required, you can use the `any` property:

```yaml title="/fern/api/definition/api.yml"
name: imdb-api
auth:
  any:
    - bearer
    - basic
```

### Requiring multiple authentication schemes

If multiple authentication schemes are required, you can use the `all` property:

```yaml title="/fern/api/definition/api.yml"
name: imdb-api
auth:
  all:
    - bearer
    - other-header
auth-schemes:
  other-header:
    header: Other-Header
```

## Applying authentication to services

For every service, you must declare whether the endpoints in that service require authentication.

```diff
  MoviesService:
+   auth: true
    base-path: /movies
    endpoints:
      createMovie:
        method: POST
        path: /create-movie
        request: CreateMovieRequest
        response: MovieId
```
