<br/>
<div align="center">
  <a href="https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-typescript&utm_content=logo">
    <img src="fern-logo.png" height="50" align="center" alt="header" />
  </a>
  
  <br/>

# TypeScript Generator

[![Contributors](https://img.shields.io/github/contributors/fern-api/fern-typescript.svg)](https://GitHub.com/dotnet/docs/graphs/contributors/)
[![Pulls-opened](https://img.shields.io/github/issues-pr/fern-api/fern-typescript.svg)](https://GitHub.com/dotnet/docs/pulls?q=is%3Aissue+is%3Aopened)
[![Pulls-merged](https://img.shields.io/github/issues-search/fern-api/fern-typescript?label=merged%20pull%20requests&query=is%3Apr%20is%3Aclosed%20is%3Amerged&color=darkviolet)](https://github.com/dotnet/docs/pulls?q=is%3Apr+is%3Aclosed+is%3Amerged)

[![Discord](https://img.shields.io/badge/Join%20Our%20Community-black?logo=discord)](https://discord.com/invite/JkkXumPzcG)

</div>

This repository contains the source for the various generators that produce TypeScript artifacts for [Fern](https://github.com/fern-api/fern):

- `fernapi/fern-typescript-node-sdk`
- `fernapi/fern-typescript-browser-sdk`
- `fernapi/fern-typescript-express`

The TypeScript generators are written in TypeScript. We strongly emphasize idiomatic code generation that feels hand-written and is friendly to read.

Fern handles transforming an API definition -- either an OpenAPI or Fern specification -- into Fern _intermediate representation_. IR is a normalized, Fern-specific definition of an API containing its endpoints, models, errors, authentication scheme, version, and more. Then the TypeScript generator takes over and turns the IR into production-ready code.

## What is Fern?

Fern is an open source toolkit for designing, building, and consuming REST APIs. With Fern, you can generate client libraries, API documentation and boilerplate for your backend server.

Head over to the [official Fern website](https://www.buildwithfern.com/?utm_source=github&utm_medium=readme&utm_campaign=fern-typescript&utm_content=homepage) for more information, or head over to our [Documentation](https://www.buildwithfern.com/docs/intro?utm_source=github&utm_medium=readme&utm_campaign=fern-typescript&utm_content=documentation) to dive straight in and find out what Fern can do for you!

## Generating TypeScript

This generator is used via the [Fern CLI](https://github.com/fern-api/fern), by defining one of the aforementioned TypeScript artifacts as a generator:

```yml
- name: fernapi/fern-typescript-node-sdk
  version: 0.7.1
  output:
    location: npm
    url: npm.buildwithfern.com
    package-name: "@my-org/petstore"
```

By default, Fern runs the generators in the cloud. To run a generator on your local machine, using the `--local` flag for `fern generate`. This will run the generator locally in a Docker container, allowing you to inspect its logs and output. [Read more.](https://buildwithfern.com/docs/compiler/cli-reference#running-locally)

## Configuration

You can customize the behavior of generators in `generators.yml`:

```yml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 0.7.1
        config: # <--
          useBrandedStringAliases: true
```

### SDK Configuration

The Node SDK and Browser SDK generators support the following options:

#### ✨ `useBrandedStringAliases`

**Type:** boolean

**Default:** `false`

When enabled, string aliases are generated as branded strings. This makes each
alias feel like its own type and improves compile-time safety.

<details>

<summary>View example</summary>

```yaml
# fern definition

types:
  MyString: string
  OtherString: string
```

```typescript
// generated code

export type MyString = string & { __MyString: void };
export const MyString = (value: string): MyString => value as MyString;

export type OtherString = string & { __OtherString: void };
export const OtherString = (value: string): OtherString => value as OtherString;
```

```typescript
// consuming the generated type

function printMyString(s: MyString): void {
  console.log("MyString: " + s);
}

// doesn't compile, "foo" is not assignable to MyString
printMyString("foo");

const otherString = OtherString("other-string");
// doesn't compile, otherString is not assignable to MyString
printMyString(otherString);

// compiles
const myString = MyString("my-string");
printMyString(myString);
```

When `useBrandedStringAliases` is disabled (the default), string aliases are generated as
normal TypeScript aliases:

```typescript
// generated code

export type MyString = string;

export type OtherString = string;
```

</details>

#### ✨ `neverThrowErrors`

**Type:** boolean

**Default:** `false`

When enabled, the client doesn't throw errors when a non-200 response is received from the server.
Instead, the response is wrapped in an [`ApiResponse`](packages/core-utilities/fetcher/src/APIResponse.ts).

```typescript
const response = await client.callEndpoint(...);
if (response.ok) {
  console.log(response.body)
} else {
  console.error(respons.error)
}
```

#### ✨ `namespaceExport`

**Type:** string

By default, the exported namespace and client are named based on the organization and API names in the Fern Definition.

```typescript
import { AcmeApi, AcmeApiClient } from "@acme/node";
```

To customize these names, you can use `namepaceExport`:

```yaml
# generators.yml
config:
  namespaceExport: Acme
```

```typescript
import { Acme, AcmeClient } from "@acme/node";
```

#### ✨ `outputEsm`

**Type:** boolean

**Default:** `false`

By default, the generated TypeScript targets CommonJS. Set `outputEsm` to `true` to target `esnext` instead.

#### ✨ `outputSourceFiles`

**Type:** boolean

**Default:** `false`

_Note: This only applies when dumping code locally. This configuration is ignored when publishing to Github or npm._

When enabled, the generator outputs raw TypeScript files.

When disabled (the default), the generator outputs `.js` and `d.ts` files.

#### ✨ `includeCredentialsOnCrossOriginRequests`

**Type:** boolean

**Default:** `false`

When enabled, [`withCredentials`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials) is set to `true`
when making network requests.

#### ✨ `allowCustomFetcher`

**Type:** boolean

**Default:** `false`

When enabled, the generated client allows the end user to specify a custom fetcher implementation.

```typescript
const acme = new AcmeClient({
  fetcher: (args) => {
    ...
  },
});
```

#### ✨ `requireDefaultEnvironment`

**Type:** boolean

**Default:** `false`

When enabled, the generated client doesn't allow the user to specify a server URL.

When disabled (the default), the generated client includes an option to override the server URL:

```typescript
const acme = new AcmeClient({
  environment: "localhost:8080",
});
```

#### ✨ `defaultTimeoutInSeconds`

**Type:** number

**Default:** 60

The default timeout for network requests. In the generated client, this can be overridden at the request level.

#### ✨ `skipResponseValidation`

**Type:** boolean

**Default:** `false`

By default, the client will throw an error if the response from the server
doesn't match the expected type (based on how the response is modeled in the
Fern Definition).

If `skipResponseValidation` is enabled, the client will never throw if the response is misshapen. Rather, the client
will log the issue using `console.warn` and return the data (casted to the expected response type).

#### ✨ `extraDependencies`

**Type:** map\<string, string\>

**Default:** `{}`

_Note: This only applies when publishing to Github._

You can use `extraDependencies` to specify extra dependencies in the generated package.json. This is useful
when you utilize [`.fernignore`](https://buildwithfern.com/docs/compiler/fern-generate#fernignore) to
supplement the generated client with custom code.

```yaml
# generators.yml
config:
  extraDependencies:
    lodash: "3.0.2"
```

#### ✨ `extraDevDependencies`

**Type:** map\<string, string\>

**Default:** `{}`

_Note: This only applies when publishing to Github._

You can use `extraDevDependencies` to specify extra dev dependencies in the generated package.json. 

```yaml
# generators.yml
config:
  extraDevDependencies:
    jest: "29.0.7"
```

#### ✨ `treatUnknownAsAny`

**Type:** boolean

**Default:** `false`

In Fern, there's an `unknown` type that represents data that isn't knowable at runtime. By default,
these types are generated into TypeScript as the `unknown` type.

When `treatUnknownAsAny` is enabled, `unknown` types from Fern are generated into TypeScript using `any`.

#### ✨ `noSerdeLayer`

**Type:** boolean

**Default:** `false`

By default, the generated client includes a layer for serializing requests and deserializing responses. This has three benefits:

1. The client validates requests and response at runtime, client-side.

2. The client can support complex types, like `Date` and `Set`.

3. The generated types can stray from the wire/JSON representation to be more
   idiomatic. For example, when `noSerdeLayer` is disabled, all properties are `camelCase`,
   even if the server is expecting `snake_case`.

When `noSerdeLayer` is enabled, no (de-)serialization code is generated. The client uses `JSON.parse()` and `JSON.stringify()` instead.

#### ✨ `noOptionalProperties`

**Type:** boolean

**Default:** `false`

By default, Fern's `optional<>` properties will translate to optional TypeScript properties:

```yaml
Person:
  properties:
    name: string
    age: optional<integer>
```

```typescript
interface Person {
  name: string;
  age?: number;
}
```

When `noOptionalProperties` is enabled, the generated properties are never optional. Instead, the type is generated with `| undefined`:

```typescript
interface Person {
  name: string;
  age: number | undefined;
}
```

### Express Configuration

The following options are supported when generating an Express backend:

#### ✨ `useBrandedStringAliases`

See [useBrandedStringAliases](#useBrandedStringAliases) under SDK Configuration

#### ✨ `treatUnknownAsAny`

See [treatUnknownAsAny](#treatUnknownAsAny) under SDK Configuration

#### ✨ `noSerdeLayer`

See [noSerdeLayer](#noSerdeLayer) under SDK Configuration

#### ✨ `outputSourceFiles`

See [outputSourceFiles](#outputSourceFiles) under SDK Configuration

#### ✨ `areImplementationsOptional`

**Type:** boolean

**Default:** `false`

By default, the generated `register()` will require an implementatiion for every
service defined in your Fern Definition.

If `areImplementationsOptional` is enabled, then `register()` won't require any
implementations. Note that this is mildly dangerous, if you forget to include
an implementation, then your server behavior may drift from your docs and clients.

#### ✨ `doNotHandleUnrecognizedErrors`

**Type:** boolean

**Default:** `false`

By default, if you throw a non-Fern error in your endpoint handler, it will be caught by generated code
and a 500 response will be returned. No details from the error will be leaked to the client.

If `doNotHandleUnrecognizedErrors` is enabled and you throw a non-Fern error, the error will be caught
and passed on with `next(error)`. It's your responsibility to set up error-catching middleware that handles
the error and returns a response to the client.

## Dependencies

The generated TypeScript code has the following dependencies:

- [@ungap/url-search-params](https://www.npmjs.com/package/@ungap/url-search-params)
- [url-join](https://www.npmjs.com/package/url-join)
- [form-data](https://www.npmjs.com/package/form-data)
- [axios](https://www.npmjs.com/package/axios)
- [js-base64](https://www.npmjs.com/package/js-base64)

If you are packaging your code manually, make sure to include them in your `package.json`.

## Releases

All generator releases are published in the [Releases section of the GitHub repository](https://github.com/fern-api/fern-typescript/releases). You can directly use these version numbers in your generator configuration files.

For instance, if you want to use version `0.7.1` of the Node SDK generator:

```yaml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-typescript-node-sdk
        version: 0.7.1
        output:
          location: local-file-system
          path: ../../generated/typescript
```

Fern will handle the rest automatically.

## Contributing

We greatly value community contributions. All the work on Fern generators happens right here on GitHub, both Fern developers and community contributors work together through submitting code via Pull Requests. See the contribution guidelines in [CONTRIBUTING](./CONTRIBUTING.md) on how you can contribute to Fern!

<a href="https://github.com/fern-api/fern-typescript/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fern-api/fern-typescript" />
</a>
