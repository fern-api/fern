# Reference

## Endpoints Container

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnListOfPrimitives</a>({ ...params }) -> string[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnListOfPrimitives(["string", "string"]);
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `string[]`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Container.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnListOfObjects</a>({ ...params }) -> SeedExhaustive.ObjectWithRequiredField[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnListOfObjects([
    {
        string: "string",
    },
    {
        string: "string",
    },
]);
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.ObjectWithRequiredField[]`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Container.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnSetOfPrimitives</a>({ ...params }) -> Set<string></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnSetOfPrimitives(new Set(["string"]));
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Set<string>`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Container.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnSetOfObjects</a>({ ...params }) -> SeedExhaustive.ObjectWithRequiredField[]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnSetOfObjects(
    new Set([
        {
            string: "string",
        },
    ])
);
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.ObjectWithRequiredField[]`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Container.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnMapPrimToPrim</a>({ ...params }) -> Record<string, string></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnMapPrimToPrim({
    string: "string",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Record<string, string>`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Container.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnMapOfPrimToObject</a>({ ...params }) -> Record<string, SeedExhaustive.ObjectWithRequiredField></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnMapOfPrimToObject({
    string: {
        string: "string",
    },
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Record<string, SeedExhaustive.ObjectWithRequiredField>`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Container.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnOptional</a>({ ...params }) -> SeedExhaustive.ObjectWithRequiredField | undefined</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnOptional({
    string: "string",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.ObjectWithRequiredField`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Container.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Endpoints ContentType

<details><summary><code>client.endpoints.contentType.<a href="/src/api/resources/endpoints/resources/contentType/client/Client.ts">postJsonPatchContentType</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.contentType.postJsonPatchContentType({
    string: "string",
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: "2024-01-15T09:30:00Z",
    date: "2023-01-15",
    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    base64: "SGVsbG8gd29ybGQh",
    list: ["list", "list"],
    set: new Set(["set"]),
    map: {
        1: "map",
    },
    bigint: "1000000",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.ObjectWithOptionalField`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContentType.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.contentType.<a href="/src/api/resources/endpoints/resources/contentType/client/Client.ts">postJsonPatchContentWithCharsetType</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.contentType.postJsonPatchContentWithCharsetType({
    string: "string",
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: "2024-01-15T09:30:00Z",
    date: "2023-01-15",
    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    base64: "SGVsbG8gd29ybGQh",
    list: ["list", "list"],
    set: new Set(["set"]),
    map: {
        1: "map",
    },
    bigint: "1000000",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.ObjectWithOptionalField`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ContentType.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Endpoints Enum

<details><summary><code>client.endpoints.enum.<a href="/src/api/resources/endpoints/resources/enum/client/Client.ts">getAndReturnEnum</a>({ ...params }) -> SeedExhaustive.WeatherReport</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.enum.getAndReturnEnum("SUNNY");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.WeatherReport`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Enum.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Endpoints HttpMethods

<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">testGet</a>(id) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.httpMethods.testGet("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `HttpMethods.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">testPost</a>({ ...params }) -> SeedExhaustive.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.httpMethods.testPost({
    string: "string",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.ObjectWithRequiredField`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `HttpMethods.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">testPut</a>(id, { ...params }) -> SeedExhaustive.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.httpMethods.testPut("id", {
    string: "string",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string`

</dd>
</dl>

<dl>
<dd>

**request:** `SeedExhaustive.ObjectWithRequiredField`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `HttpMethods.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">testPatch</a>(id, { ...params }) -> SeedExhaustive.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.httpMethods.testPatch("id", {
    string: "string",
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: "2024-01-15T09:30:00Z",
    date: "2023-01-15",
    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    base64: "SGVsbG8gd29ybGQh",
    list: ["list", "list"],
    set: new Set(["set"]),
    map: {
        1: "map",
    },
    bigint: "1000000",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string`

</dd>
</dl>

<dl>
<dd>

**request:** `SeedExhaustive.ObjectWithOptionalField`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `HttpMethods.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">testDelete</a>(id) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.httpMethods.testDelete("id");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `string`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `HttpMethods.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Endpoints Object

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithOptionalField</a>({ ...params }) -> SeedExhaustive.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnWithOptionalField({
    string: "string",
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: "2024-01-15T09:30:00Z",
    date: "2023-01-15",
    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    base64: "SGVsbG8gd29ybGQh",
    list: ["list", "list"],
    set: new Set(["set"]),
    map: {
        1: "map",
    },
    bigint: "1000000",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.ObjectWithOptionalField`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Object_.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithRequiredField</a>({ ...params }) -> SeedExhaustive.ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnWithRequiredField({
    string: "string",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.ObjectWithRequiredField`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Object_.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithMapOfMap</a>({ ...params }) -> SeedExhaustive.ObjectWithMapOfMap</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnWithMapOfMap({
    map: {
        map: {
            map: "map",
        },
    },
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.ObjectWithMapOfMap`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Object_.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithOptionalField</a>({ ...params }) -> SeedExhaustive.NestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnNestedWithOptionalField({
    string: "string",
    nestedObject: {
        string: "string",
        integer: 1,
        long: 1000000,
        double: 1.1,
        bool: true,
        datetime: "2024-01-15T09:30:00Z",
        date: "2023-01-15",
        uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        base64: "SGVsbG8gd29ybGQh",
        list: ["list", "list"],
        set: new Set(["set"]),
        map: {
            1: "map",
        },
        bigint: "1000000",
    },
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.NestedObjectWithOptionalField`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Object_.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithRequiredField</a>(string, { ...params }) -> SeedExhaustive.NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnNestedWithRequiredField("string", {
    string: "string",
    nestedObject: {
        string: "string",
        integer: 1,
        long: 1000000,
        double: 1.1,
        bool: true,
        datetime: "2024-01-15T09:30:00Z",
        date: "2023-01-15",
        uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        base64: "SGVsbG8gd29ybGQh",
        list: ["list", "list"],
        set: new Set(["set"]),
        map: {
            1: "map",
        },
        bigint: "1000000",
    },
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**string:** `string`

</dd>
</dl>

<dl>
<dd>

**request:** `SeedExhaustive.NestedObjectWithRequiredField`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Object_.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithRequiredFieldAsList</a>({ ...params }) -> SeedExhaustive.NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnNestedWithRequiredFieldAsList([
    {
        string: "string",
        nestedObject: {
            string: "string",
            integer: 1,
            long: 1000000,
            double: 1.1,
            bool: true,
            datetime: "2024-01-15T09:30:00Z",
            date: "2023-01-15",
            uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            base64: "SGVsbG8gd29ybGQh",
            list: ["list", "list"],
            set: new Set(["set"]),
            map: {
                1: "map",
            },
            bigint: "1000000",
        },
    },
    {
        string: "string",
        nestedObject: {
            string: "string",
            integer: 1,
            long: 1000000,
            double: 1.1,
            bool: true,
            datetime: "2024-01-15T09:30:00Z",
            date: "2023-01-15",
            uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            base64: "SGVsbG8gd29ybGQh",
            list: ["list", "list"],
            set: new Set(["set"]),
            map: {
                1: "map",
            },
            bigint: "1000000",
        },
    },
]);
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.NestedObjectWithRequiredField[]`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Object_.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Endpoints Params

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithPath</a>(param) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.params.getWithPath("param");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**param:** `string`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Params.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithQuery</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with query param

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.params.getWithQuery({
    query: "query",
    number: 1,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.endpoints.GetWithQuery`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Params.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithAllowMultipleQuery</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with multiple of same query param

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.params.getWithAllowMultipleQuery({
    query: "query",
    numer: 1,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.endpoints.GetWithMultipleQuery`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Params.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithPathAndQuery</a>(param, { ...params }) -> void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.params.getWithPathAndQuery("param", {
    query: "query",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**param:** `string`

</dd>
</dl>

<dl>
<dd>

**request:** `SeedExhaustive.endpoints.GetWithPathAndQuery`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Params.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">modifyWithPath</a>(param, { ...params }) -> string</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.params.modifyWithPath("param", "string");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**param:** `string`

</dd>
</dl>

<dl>
<dd>

**request:** `string`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Params.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Endpoints Primitive

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnString</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.primitive.getAndReturnString("string");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `string`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Primitive.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnInt</a>({ ...params }) -> number</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.primitive.getAndReturnInt(1);
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `number`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Primitive.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnLong</a>({ ...params }) -> number</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.primitive.getAndReturnLong(1000000);
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `number`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Primitive.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnDouble</a>({ ...params }) -> number</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.primitive.getAndReturnDouble(1.1);
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `number`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Primitive.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnBool</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.primitive.getAndReturnBool(true);
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `boolean`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Primitive.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnDatetime</a>({ ...params }) -> Date</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.primitive.getAndReturnDatetime("2024-01-15T09:30:00Z");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Date`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Primitive.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnDate</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.primitive.getAndReturnDate("2023-01-15");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `string`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Primitive.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnUuid</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.primitive.getAndReturnUuid("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `string`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Primitive.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnBase64</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.primitive.getAndReturnBase64("SGVsbG8gd29ybGQh");
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `string`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Primitive.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## Endpoints Union

<details><summary><code>client.endpoints.union.<a href="/src/api/resources/endpoints/resources/union/client/Client.ts">getAndReturnUnion</a>({ ...params }) -> SeedExhaustive.Animal</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.union.getAndReturnUnion({
    animal: "dog",
    name: "name",
    likesToWoof: true,
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.Animal`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `Union.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## InlinedRequests

<details><summary><code>client.inlinedRequests.<a href="/src/api/resources/inlinedRequests/client/Client.ts">postWithObjectBodyandResponse</a>({ ...params }) -> SeedExhaustive.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST with custom object in request body, response is an object

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.inlinedRequests.postWithObjectBodyandResponse({
    string: "string",
    integer: 1,
    nestedObject: {
        string: "string",
        integer: 1,
        long: 1000000,
        double: 1.1,
        bool: true,
        datetime: "2024-01-15T09:30:00Z",
        date: "2023-01-15",
        uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        base64: "SGVsbG8gd29ybGQh",
        list: ["list", "list"],
        set: new Set(["set"]),
        map: {
            1: "map",
        },
        bigint: "1000000",
    },
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.PostWithObjectBody`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlinedRequests.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## NoAuth

<details><summary><code>client.noAuth.<a href="/src/api/resources/noAuth/client/Client.ts">postWithNoAuth</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with no auth

</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.noAuth.postWithNoAuth({
    key: "value",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `unknown`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `NoAuth.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## NoReqBody

<details><summary><code>client.noReqBody.<a href="/src/api/resources/noReqBody/client/Client.ts">getWithNoRequestBody</a>() -> SeedExhaustive.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.noReqBody.getWithNoRequestBody();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `NoReqBody.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

<details><summary><code>client.noReqBody.<a href="/src/api/resources/noReqBody/client/Client.ts">postWithNoRequestBody</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.noReqBody.postWithNoRequestBody();
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**requestOptions:** `NoReqBody.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>

## ReqWithHeaders

<details><summary><code>client.reqWithHeaders.<a href="/src/api/resources/reqWithHeaders/client/Client.ts">getWithCustomHeader</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.reqWithHeaders.getWithCustomHeader({
    xTestServiceHeader: "X-TEST-SERVICE-HEADER",
    xTestEndpointHeader: "X-TEST-ENDPOINT-HEADER",
    body: "string",
});
```

</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SeedExhaustive.ReqWithHeaders`

</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ReqWithHeaders.RequestOptions`

</dd>
</dl>
</dd>
</dl>

</dd>
</dl>
</details>
