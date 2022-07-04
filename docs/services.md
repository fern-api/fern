# Defining a service

This page is about defining a REST service, which communciates over HTTP.

_If you're interested in defining a realtime API (e.g. over WebSocket), you'll likely want to [define a channel](channels.md) instead._

A service consists of **endpoints**. Each endpoint has a path and an associated HTTP method (e.g. `GET`, `POST`).

## Requests and responses

Endpoints can optionally provided requests and responses, which are used as the HTTP message body.

```diff-yaml diff-highlight
types:
  ZipCode: string
services:
  WeatherService:
    base-path: /weather
    auth: none
    endpoints:
      isItRaining:
        docs: Check if it's currently raining in the provided zip code!
        path: /is-it-raining
        method: GET
+       request: ZipCode
+       response: boolean
```

You can also define requests and responses inline:

```diff-yaml diff-highlight
services:
  WeatherService:
    base-path: /weather
    auth: none
    endpoints:
      isItRaining:
        docs: Check if it's currently raining in the provided city!
        path: /is-it-raining
        method: GET
        request:
+         properties:
+           city: string
+           country: string
        response: boolean
```

## Path and query parameters

You can specify **path parameters** and **query parameters** for each endpoint.

**Path parameters** are parsed from the endpoint URL, e.g. `/weather/is-it-raining/98112`.

```diff-yaml diff-highlight
types:
  ZipCode: string
services:
  WeatherService:
    base-path: /weather
    auth: none
    endpoints:
      isItRaining:
        docs: Check if it's currently raining in the provided zip code!
+       path: /is-it-raining/{zipCode}
+       path-parameters:
+         zipCode: ZipCode
        method: GET
        response: boolean
```

**Query parameters** are appended to the endpoint URL, e.g. `/weather/is-it-raining/98112?includeNearbyAreas=true`.

> **Note:** To encourage best practices, all query parameters are implicitly typed as `optional`. API consumers are never required to supply them.

```diff-yaml diff-highlight
types:
  ZipCode: string
services:
  WeatherService:
    base-path: /weather
    auth: none
    endpoints:
      isItRaining:
        docs: Check if it's currently raining in the provided zip code!
        path: /is-it-raining/{zipCode}
        path-parameters:
          zipCode: ZipCode
+       query-parameters:
+         includeNearbyAreas:
+           type: boolean
+           docs: if true, we'll also tell you if it's raining nearby
        method: GET
        response: boolean
```

## Errors

Every endpoint can specify [errors](errors.md) - i.e. responses that indicate that something went wrong. The endpoint's `errors` field must be a union.

```diff-yaml diff-highlight
 types:
   ZipCode: string
 services:
   WeatherService:
     base-path: /weather
     auth: none
     endpoints:
       isItRaining:
         docs: Check if it's currently raining in the provided zip code!
         path: /is-it-raining/{zipCode}
         path-parameters:
           zipCode: ZipCode
         method: GET
         response:
+          ok: boolean
+          errors:
+            union:
+              invalidZipCode: NotFoundError
+errors:
+  NotFoundError:
+    http:
+      statusCode: 404
```

## Authentication

Services require authentication. Currently, Fern only supports bearer tokens using the via the `Authorization` header.

```diff-yaml diff-highlight
types:
  ZipCode: string
services:
  WeatherService:
    base-path: /weather
+   auth: bearer
    endpoints:
      isItRaining:
        docs: Check if it's currently raining in the provided zip code!
        path: /is-it-raining/{zipCode}
        path-parameters:
          zipCode: ZipCode
        method: GET
        response: boolean
```
