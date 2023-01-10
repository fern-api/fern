![Fern header](header.png)

<p align="center">
  <a href="https://www.npmjs.com/package/fern-api" alt="fern-api npm package">
    <img src="https://img.shields.io/npm/v/fern-api?style=flat-square" />
  </a>
</p>

<div align="center">
  <a href="https://www.buildwithfern.com/docs" alt="documentation">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://discord.com/invite/JkkXumPzcG" alt="discord">Discord</a>
  <br />
</div>

---

**Fern is an open source format for defining REST APIs.**
You can think of it like a programming language to describe
your API: your endpoints, types, errors, and examples.

This repository contains the **Fern compiler.** The compiler transforms the API description into useful outputs, like:

### 🌿 SDKs

Client libraries speed up internal developement, and help acquire customers who use your API. Our auto-generated SDKs are idiomatic and feel handwritten.

[TypeScript SDK generator ➚](https://github.com/fern-api/fern-typescript)

[Java SDK generator ➚](https://github.com/fern-api/fern-java)

### 🌿 Server-side code generation

We automatically generate lots of boilerplate on the server side, like Pydantic models for FastAPI and Jersey interfaces for Spring Boot. We also add compile-time validation that all your endpoints are being served correctly.

[FastAPI generator ➚](https://github.com/fern-api/fern-python)

[Spring Boot generator ➚](https://github.com/fern-api/fern-java)

### 🌿 Postman Collection

Complete with examples of successful and unsuccessful requests!

[Postman generator ➚](https://github.com/fern-api/fern-postman)

### 🌿 An OpenAPI spec

You can feed the generated OpenAPI into the endless list of tools that support OpenAPI.

[OpenAPI generator ➚](https://github.com/fern-api/fern-postman)

# Get started

```bash
npm install -g fern-api
```

### The `fern/` directory

The `fern/` directory contains your API definition. This generally lives in your
backend repo, but you can also have an independent repo dedicated to your API (like [Raven's](https://github.com/ravenappdev/raven-api)).

In the root of your repo, run:

```bash
fern init
```

This will create the following folder structure in your project:

```yaml
fern/
├─ fern.config.json # root-level configuration
└─ api/ # your API
  ├─ generators.yml # generators you're using
  └─ definition/
    ├─ api.yml  # API-level configuration
    └─ imdb.yml # endpoints, types, and errors
```

### Generating an SDK

To generate SDKs, you can log in with GitHub from the CLI:

```bash
fern login
```

You can add [generators](compiler/generators) using `fern add`. By default, this
will publish your SDK to the Fern npm registry (npm.buildwithfern.com).

```bash
fern add fern-typescript-sdk
```

To generate the TypeScript SDK, run:

```bash
fern generate
```

And voila! You just built a TypeScript SDK.

# Defining your API

A Fern Definition is a set of YAML files that describe your API. It lives in the `definition/` folder.

Each Fern Definition file may define:

- **Custom types.** Use custom types to build your data model.
- **Services.** A service is a set of related REST endpoints.
- **Errors.** An error represents a failed (non-200) response from an endpoint.

## Built-in types

- **`string`**
- **`integer`**
- **`long`**
- **`double`**
- **`boolean`**
- **`datetime`** _An [ISO-8601 timestamp](https://en.wikipedia.org/wiki/ISO_8601)._
- **`uuid`**
- **`list`** _e.g. list\<string\>_
- **`set`** _e.g. set\<string\>_
- **`map`** _e.g. map\<string, integer\>_
- **`optional`** _e.g. optional\<string\>_

**`unknown`**

Fern comes with a special type `unknown`, which signifies that the type cannot
be represented in Fern. Often, this is because the value has a dynamic shape
(e.g. user-supplied data).

In cases where you use `unknown`, Fern will assume the value is optional. There's
no difference between `unknown` and `optional<unknown>`.

## Custom types

Creating your own types is easy in Fern!

### Objects

The most common custom types are **objects**.

In Fern, you use the `"properties"` key to create an object:

```yaml
types:
  Person:
    properties: # <---
      name: string
      address: Address

  Address:
    properties: # <---
      line1: string
      line2: optional<string>
      city: string
      state: string
      zip: string
```

These represent JSON objects:

```json
{
  "name": "Alice",
  "address": {
    "line1": "123 Happy Lane",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  }
}
```

You can also use **extends** to compose objects:

```yaml
types:
  Pet:
    properties:
      name: string
  Dog:
    extends: Pet
    properties:
      breed: string
```

### Aliases

An Alias type is a renaming of an existing type. This is usually done for clarity.

```yaml
types:
  # UserId is an alias of string
  UserId: string

  User:
    properties:
      id: UserId
      name: string
```

### Enums

An enum represents a string with a set of allowed values.

In Fern, you use the `"enum"` key to create an enum:

```yaml
types:
  WeatherReport:
    enum: # <---
      - SUNNY
      - CLOUDY
      - RAINING
      - SNOWING
```

### Unions

Fern supports tagged unions (a.k.a. discriminated unions). Unions are useful for
polymorphism. This is similar to the `oneOf` concept in OpenAPI.

In Fern, you use the `"union"` key to create an union:

```yaml
types:
  Animal:
    union:
      dog: Dog
      cat: Cat
  Dog:
    properties:
      likesToWoof: boolean
  Cat:
    properties:
      likesToMeow: boolean
```

In JSON, unions have a **discriminant property** to differentiate between
different members of the union. By default, Fern uses `"type"` as the
discriminant property:

```json
{
  "type": "dog",
  "likesToWoof": true
}
```

You can customize the discriminant property using the "discriminant" key:

```diff
 types:
   Animal:
+    discriminant: animalType
     union:
       dog: Dog
       cat: Cat
   Dog:
     properties:
       likesToWoof: boolean
   Cat:
     properties:
       likesToMeow: boolean
```

This corresponds to a JSON object like this:

```json
{
  "animalType": "dog",
  "likesToWoof": true
}
```

### Documentation

You can add documentation for types. These docs are passed into the compiler,
and are incredibly useful in the generated outputs (e.g. docstrings in SDKs).

```yaml
types:
  Person:
    docs: A person represents a human being
    properties:
      name: string
      age:
        docs: age in years
        type: integer
```

```typescript Generated TypeScript SDK
/**
 * A person represents a human being
 */
interface Person {
  name: string;
  // age in years
  age: number;
}
```

### Examples

You can add examples for types. These are passed into the compiler to be used in
the generated outputs (e.g. examples in the Postman Collection).

```yaml
types:
  UserId:
    docs: A unique identifier for a user
    type: string
    examples:
      - value: user-id-123
```

```typescript Generated TypeScript SDK
/**
 * A unique identifier for a user
 *
 * @example "user-id-123"
 */
type UserId = string;
```

The Fern compiler validates that your examples match the expected types. For
example, this won't compile:

```yaml
types:
  UserId:
    type: integer
    examples:
      - value: hello # not an integer
```

#### Referencing examples from other types

Just like types, you can compose examples. To reference an example from another
type, use `$`.

```yaml
types:
  UserId:
    type: integer
    examples:
      - name: Example1
        value: user-id-123

  User:
    properties:
      id: UserId
      name: string
    examples:
      - value:
          id: $UserId.Example1 # <---
          name: Jane Smith
```

## Service Definition

Each service defines:

1. A **base-path**: A common prefix for all the endpoints's HTTP paths
2. Whether the service requires [authentication](./api-yml#authentication)
3. **Endpoints**

```yaml user.yml
services:
  http:
    UserService:
      base-path: /users
      auth: false
      endpoints: {}
```

## Endpoints

An endpoint includes:

- A **URL path** (optionally including path parameters)
- An **HTTP Method**
- **Request information** _(Optional)_
  - **Query-parameters**
  - **Headers**
  - **Request body**
- **Successful (200) response** information _(Optional)_
- **Error (non-200) responses** that this endpoint might return _(Optional)_

## URL Path

Each endpoint has a URL path.

```yaml user.yml
services:
  http:
    UserService:
      base-path: /users
      auth: false
      endpoints:
        getAllUsers:
          path: /all # <---
          method: GET
```

The full path for the endpoint is the concatenation of:

- The [environment](./api-yml#environments) URL
- The service `base-path`
- The endpoint `path`

### Path parameters

You can supply path parameters for your endpoints to create dynamic URLs.

```yaml user.yml
services:
  http:
    UserService:
      base-path: /users
      auth: false
      endpoints:
        getUser:
          path: /{userId} # <---
          path-parameters: # <---
            userId: string
          method: GET
```

Services can also have path-parameters:

```yaml project.yml
services:
  http:
    ProjectService:
      base-path: /projects/{projectId}
      path-parameters:
        projectId: string
      auth: false
      endpoints: ...
```

## Query parameters

Each endpoint can specify query parameters:

```yaml user.yml
services:
  http:
    UserService:
      base-path: /users
      auth: false
      endpoints:
        getAllUsers:
          path: /all
          method: GET
          request:
            # this name is required for idiomatic SDKs
            name: GetAllUsersRequest
            query-parameters:
              limit: optional<integer>
```

### `allow-multiple`

You can use `allow-multiple` to specify that a query parameter is allowed
multiple times in the URL, e.g. `?filter=jane&filter=smith`. This will alter
the generated SDKs so that consumers can provide multiple values for the query
parameter.

```yaml user.yml
query-parameters:
  filter: string
  allow-multiple: true # <---
```

## Headers

Each endpoint can specify request headers:

```yaml user.yml
services:
  http:
    UserService:
      base-path: /users
      auth: false
      endpoints:
        getAllUsers:
          path: /all
          method: GET
          request:
            # this name is required for idiomatic SDKs
            name: GetAllUsersRequest
            headers:
              X-Endpoint-Header: string
```

Services can also specify request headers. These headers will cascade to the service's endpoints.

```diff user.yml
services:
  http:
    UserService:
      base-path: /users
      auth: false
+     headers:
+       X-Service-Header: string
      endpoints:
        getAllUsers:
          path: /all
          method: GET
          request:
            # this name is required for idiomatic SDKs
            name: GetAllUsersRequest
            headers:
              X-Endpoint-Header: string
```

## Request body

Endpoints can specify a request body type.

```yaml user.yml
services:
  http:
    UserService:
      base-path: /users
      auth: false
      endpoints:
        setUserName:
          path: /{userId}/set-name
          path-parameters:
            userId: string
          method: POST
          request:
            # this name is required for idiomatic SDKs
            name: SetUserNameRequest
            body: string # <---
```

### Inlining a request body

If the request body is an object, you can **inline the type declaration.** This
makes the generated SDKs a bit more idiomatic.

```yaml user.yml
services:
  http:
    UserService:
      base-path: /users
      auth: false
      endpoints:
        createUser:
          path: /create
          method: POST
          request:
            # this name is required for idiomatic SDKs
            name: CreateUserRequest
            body:
              properties:
                userName: string
```

## Success response

Endpoints can specify a `response`, which is the type of the body that will be
returned on a successful (200) call.

```yaml user.yml
services:
  http:
    UserService:
      base-path: /users
      auth: false
      endpoints:
        getAllUsers:
          path: /all
          method: GET
          response: list<User>

types:
  User:
    properties:
      userId: string
      name: string
```

## Error responses

Endpoints can specify error responses, which detail the non-200 responses that
the endpoint might return

```yaml user.yml
services:
  http:
    UserService:
      base-path: /users
      auth: false
      endpoints:
        getUser:
          path: /{userId}
          path-parameters:
            userId: string
          method: GET
          response: User
          errors:
            - UserNotFoundError

types:
  User:
    properties:
      userId: string
      name: string

errors:
  UserNotFoundError:
    status-code: 404
```

You can learn more about how to define errors on the [Errors](./errors) page.

## Specifying examples

When you declare an example, you can also specify some examples of how that
endpoint might be used. These are used by the compiler to enhance the generated
outputs (e.g. examples in the generated Postman Collection).

```yaml user.yml
services:
  http:
    UserService:
      base-path: /users
      auth: false
      endpoints:
        getUser:
          path: /{userId}
          path-parameters:
            userId: string
          method: GET
          response: User
          errors:
            - UserNotFoundError
          examples: # <---
            - path-parameters:
                userId: alice-user-id
              response:
                body:
                  userId: alice-user-id
                  name: Alice

types:
  User:
    properties:
      userId: string
      name: string

errors:
  UserNotFoundError:
    status-code: 404
```

Examples contain all the information about the endpoint call, including
the request body, path paramters, query parameters, headers, and response body.

```yaml user.yml
examples:
  - path-parameters:
      userId: some-user-id
    query-parameters:
      limit: 50
    headers:
      X-My-Header: some-value
    response:
      body:
        response-field: hello
```

### Failed examples

You can also specify examples of failed endpoints calls. Add the `error`
property to a response example to designate which failure you're demonstrating.

```yaml user.yml
examples:
  - path-parameters:
      userId: missing-user-id
    response:
      error: UserNotFoundError # <--
```

### Referencing examples from types

To avoid duplication, you can reference examples from types using `$`.

```yaml
services:
  http:
    UserService:
      base-path: /users
      auth: true
      endpoints:
        getUser:
          method: GET
          path: /{userId}
          path-parameters:
            userId: UserId
          examples:
            - path-parameters:
                userId: $UserId.Example1 # <---

types:
  UserId:
    type: integer
    examples:
      - name: Example1
        value: user-id-123
```

## Errors

Errors represent failed (non-200) responses from endpoints.

An error has:

- An HTTP status code
- A body type _(Optional)_

```yaml user.yml
errors:
  UserNotFoundError:
    status-code: 404
    type: UserNotFoundErrorBody

types:
  UserNotFoundErrorBody:
    properties:
      requestedUserId: string
```

## Imports

Imports allow you to reference types and errors from other files

```yaml person.yml
types:
  Person: ...
```

```yaml family.yml
imports:
  person: ./path/to/person.yml
types:
  Family:
    properties:
      people: list<person.Person> # use an imported type
```

Note that you can only import files that exist in your Fern Definition (i.e. in
the same `definition/` folder).
