The TypeScript generators are written in TypeScript. We strongly emphasize idiomatic code generation that feels hand-written and is friendly to read.

Fern handles transforming an API definition -- either an OpenAPI or Fern specification -- into Fern _intermediate representation_. IR is a normalized, Fern-specific definition of an API containing its endpoints, models, errors, authentication scheme, version, and more. Then the TypeScript generator takes over and turns the IR into production-ready code.

## Generating TypeScript

This generator is used via the [Fern CLI](https://github.com/fern-api/fern), by defining one of the aforementioned TypeScript artifacts as a generator:

```yml
- name: fernapi/fern-typescript-sdk
  version: 0.7.1
  output:
    location: local-file-system
    path: ../sdks/typescript
```

## Configuration

You can customize the behavior of generators in `generators.yml`:

```yml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-typescript-sdk
        version: 0.7.1
        config: # <--
          useBrandedStringAliases: true
```

### SDK Configuration

The SDK generator support the following options:

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
  environment: "localhost:8080"
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
when you utilize [`.fernignore`](https://buildwithfern.com/learn/sdks/overview/custom-code) to
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

#### ✨ `optionalImplementations`

**Type:** boolean

**Default:** `false`

By default, the generated `register()` will require an implementation for every
service defined in your Fern Definition.

If `optionalImplementations` is enabled, then `register()` won't require any
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

#### ✨ `retainOriginalCasing`

**Type:** boolean

**Default:** `false`

When enabled, property names in the generated code will retain their original casing from the API definition instead of being converted to camelCase.

```yaml
# generators.yml
config:
  retainOriginalCasing: true
```

**Before (default behavior):**
If your API definition has a property named `display_name`, it would be converted to `displayName` in the generated TypeScript code.

**After (with retainOriginalCasing):**
The property `display_name` will remain as `display_name` in the generated TypeScript interfaces.

**Example with OpenAPI input:**
```yaml
# OpenAPI schema
components:
  schemas:
    User:
      type: object
      properties:
        user_id:
          type: string
        display_name:
          type: string
```

Generated TypeScript with `retainOriginalCasing: true`:
```typescript
export interface User {
  user_id: string;
  display_name: string;
}
```

Generated TypeScript with default settings (`retainOriginalCasing: false`):
```typescript
export interface User {
  userId: string;
  displayName: string;
}
```

## Versions

Find the latest version number and changelog for this generator in [this SDK Generators table](https://github.com/fern-api/fern?tab=readme-ov-file#sdk-generators). The changelog shows earlier version numbers, if any. You can directly use these version numbers in your generator configuration files.

For instance, if you want to use version `0.7.1` of the Node SDK generator:

```yaml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-typescript-sdk
        version: 0.7.1
        output:
          location: local-file-system
          path: ../generated/typescript
```

Fern will handle the rest automatically.
