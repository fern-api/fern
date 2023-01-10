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
