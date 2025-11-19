# Reference
## Endpoints Container
<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnListOfPrimitives</a>({ ...params }) -> core.APIResponse<string[], SeedExhaustive.endpoints.container.getAndReturnListOfPrimitives.Error></code></summary>
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

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnListOfObjects</a>({ ...params }) -> core.APIResponse<SeedExhaustive.ObjectWithRequiredField[], SeedExhaustive.endpoints.container.getAndReturnListOfObjects.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnListOfObjects([{
        string: "string"
    }, {
        string: "string"
    }]);

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

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnSetOfPrimitives</a>({ ...params }) -> core.APIResponse<string[], SeedExhaustive.endpoints.container.getAndReturnSetOfPrimitives.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnSetOfPrimitives(["string"]);

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

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnSetOfObjects</a>({ ...params }) -> core.APIResponse<SeedExhaustive.ObjectWithRequiredField[], SeedExhaustive.endpoints.container.getAndReturnSetOfObjects.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnSetOfObjects([{
        string: "string"
    }]);

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

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnMapPrimToPrim</a>({ ...params }) -> core.APIResponse<Record<string, string>, SeedExhaustive.endpoints.container.getAndReturnMapPrimToPrim.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnMapPrimToPrim({
    "string": "string"
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

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnMapOfPrimToObject</a>({ ...params }) -> core.APIResponse<Record<string, SeedExhaustive.ObjectWithRequiredField>, SeedExhaustive.endpoints.container.getAndReturnMapOfPrimToObject.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnMapOfPrimToObject({
    "string": {
        string: "string"
    }
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

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnOptional</a>({ ...params }) -> core.APIResponse<SeedExhaustive.ObjectWithRequiredField | undefined, SeedExhaustive.endpoints.container.getAndReturnOptional.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnOptional({
    string: "string"
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

**requestOptions:** `ContainerClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints ContentType
<details><summary><code>client.endpoints.contentType.<a href="/src/api/resources/endpoints/resources/contentType/client/Client.ts">postJsonPatchContentType</a>({ ...params }) -> core.APIResponse<void, SeedExhaustive.endpoints.contentType.postJsonPatchContentType.Error></code></summary>
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
    set: ["set"],
    map: {
        1: "map"
    },
    bigint: "1000000"
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

**requestOptions:** `ContentTypeClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.contentType.<a href="/src/api/resources/endpoints/resources/contentType/client/Client.ts">postJsonPatchContentWithCharsetType</a>({ ...params }) -> core.APIResponse<void, SeedExhaustive.endpoints.contentType.postJsonPatchContentWithCharsetType.Error></code></summary>
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
    set: ["set"],
    map: {
        1: "map"
    },
    bigint: "1000000"
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

**requestOptions:** `ContentTypeClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Enum
<details><summary><code>client.endpoints.enum.<a href="/src/api/resources/endpoints/resources/enum/client/Client.ts">getAndReturnEnum</a>({ ...params }) -> core.APIResponse<SeedExhaustive.WeatherReport, SeedExhaustive.endpoints.enum_.getAndReturnEnum.Error></code></summary>
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

**requestOptions:** `EnumClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints HttpMethods
<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">testGet</a>(id) -> core.APIResponse<string, SeedExhaustive.endpoints.httpMethods.testGet.Error></code></summary>
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

**requestOptions:** `HttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">testPost</a>({ ...params }) -> core.APIResponse<SeedExhaustive.ObjectWithOptionalField, SeedExhaustive.endpoints.httpMethods.testPost.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.httpMethods.testPost({
    string: "string"
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

**requestOptions:** `HttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">testPut</a>(id, { ...params }) -> core.APIResponse<SeedExhaustive.ObjectWithOptionalField, SeedExhaustive.endpoints.httpMethods.testPut.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.httpMethods.testPut("id", {
    string: "string"
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

**requestOptions:** `HttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">testPatch</a>(id, { ...params }) -> core.APIResponse<SeedExhaustive.ObjectWithOptionalField, SeedExhaustive.endpoints.httpMethods.testPatch.Error></code></summary>
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
    set: ["set"],
    map: {
        1: "map"
    },
    bigint: "1000000"
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

**requestOptions:** `HttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">testDelete</a>(id) -> core.APIResponse<boolean, SeedExhaustive.endpoints.httpMethods.testDelete.Error></code></summary>
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

**requestOptions:** `HttpMethodsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Object
<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithOptionalField</a>({ ...params }) -> core.APIResponse<SeedExhaustive.ObjectWithOptionalField, SeedExhaustive.endpoints.object.getAndReturnWithOptionalField.Error></code></summary>
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
    set: ["set"],
    map: {
        1: "map"
    },
    bigint: "1000000"
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

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithRequiredField</a>({ ...params }) -> core.APIResponse<SeedExhaustive.ObjectWithRequiredField, SeedExhaustive.endpoints.object.getAndReturnWithRequiredField.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnWithRequiredField({
    string: "string"
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

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithMapOfMap</a>({ ...params }) -> core.APIResponse<SeedExhaustive.ObjectWithMapOfMap, SeedExhaustive.endpoints.object.getAndReturnWithMapOfMap.Error></code></summary>
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
        "map": {
            "map": "map"
        }
    }
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

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithOptionalField</a>({ ...params }) -> core.APIResponse<SeedExhaustive.NestedObjectWithOptionalField, SeedExhaustive.endpoints.object.getAndReturnNestedWithOptionalField.Error></code></summary>
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
    NestedObject: {
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
        set: ["set"],
        map: {
            1: "map"
        },
        bigint: "1000000"
    }
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

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithRequiredField</a>(string, { ...params }) -> core.APIResponse<SeedExhaustive.NestedObjectWithRequiredField, SeedExhaustive.endpoints.object.getAndReturnNestedWithRequiredField.Error></code></summary>
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
    NestedObject: {
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
        set: ["set"],
        map: {
            1: "map"
        },
        bigint: "1000000"
    }
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

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithRequiredFieldAsList</a>({ ...params }) -> core.APIResponse<SeedExhaustive.NestedObjectWithRequiredField, SeedExhaustive.endpoints.object.getAndReturnNestedWithRequiredFieldAsList.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnNestedWithRequiredFieldAsList([{
        string: "string",
        NestedObject: {
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
            set: ["set"],
            map: {
                1: "map"
            },
            bigint: "1000000"
        }
    }, {
        string: "string",
        NestedObject: {
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
            set: ["set"],
            map: {
                1: "map"
            },
            bigint: "1000000"
        }
    }]);

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

**requestOptions:** `ObjectClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Params
<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithPath</a>(param) -> core.APIResponse<string, SeedExhaustive.endpoints.params.getWithPath.Error></code></summary>
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

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithInlinePath</a>({ ...params }) -> core.APIResponse<string, SeedExhaustive.endpoints.params.getWithInlinePath.Error></code></summary>
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
await client.endpoints.params.getWithInlinePath({
    param: "param"
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

**request:** `SeedExhaustive.endpoints.GetWithInlinePath` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithQuery</a>({ ...params }) -> core.APIResponse<void, SeedExhaustive.endpoints.params.getWithQuery.Error></code></summary>
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
    number: 1
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

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithAllowMultipleQuery</a>({ ...params }) -> core.APIResponse<void, SeedExhaustive.endpoints.params.getWithAllowMultipleQuery.Error></code></summary>
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
    number: 1
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

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithPathAndQuery</a>(param, { ...params }) -> core.APIResponse<void, SeedExhaustive.endpoints.params.getWithPathAndQuery.Error></code></summary>
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
    query: "query"
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

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithInlinePathAndQuery</a>({ ...params }) -> core.APIResponse<void, SeedExhaustive.endpoints.params.getWithInlinePathAndQuery.Error></code></summary>
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
await client.endpoints.params.getWithInlinePathAndQuery({
    param: "param",
    query: "query"
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

**request:** `SeedExhaustive.endpoints.GetWithInlinePathAndQuery` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">modifyWithPath</a>(param, { ...params }) -> core.APIResponse<string, SeedExhaustive.endpoints.params.modifyWithPath.Error></code></summary>
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

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">modifyWithInlinePath</a>({ ...params }) -> core.APIResponse<string, SeedExhaustive.endpoints.params.modifyWithInlinePath.Error></code></summary>
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
await client.endpoints.params.modifyWithInlinePath({
    param: "param",
    body: "string"
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

**request:** `SeedExhaustive.endpoints.ModifyResourceAtInlinedPath` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ParamsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Primitive
<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnString</a>({ ...params }) -> core.APIResponse<string, SeedExhaustive.endpoints.primitive.getAndReturnString.Error></code></summary>
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnInt</a>({ ...params }) -> core.APIResponse<number, SeedExhaustive.endpoints.primitive.getAndReturnInt.Error></code></summary>
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnLong</a>({ ...params }) -> core.APIResponse<number, SeedExhaustive.endpoints.primitive.getAndReturnLong.Error></code></summary>
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnDouble</a>({ ...params }) -> core.APIResponse<number, SeedExhaustive.endpoints.primitive.getAndReturnDouble.Error></code></summary>
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnBool</a>({ ...params }) -> core.APIResponse<boolean, SeedExhaustive.endpoints.primitive.getAndReturnBool.Error></code></summary>
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnDatetime</a>({ ...params }) -> core.APIResponse<string, SeedExhaustive.endpoints.primitive.getAndReturnDatetime.Error></code></summary>
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

**request:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnDate</a>({ ...params }) -> core.APIResponse<string, SeedExhaustive.endpoints.primitive.getAndReturnDate.Error></code></summary>
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnUuid</a>({ ...params }) -> core.APIResponse<string, SeedExhaustive.endpoints.primitive.getAndReturnUuid.Error></code></summary>
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnBase64</a>({ ...params }) -> core.APIResponse<string, SeedExhaustive.endpoints.primitive.getAndReturnBase64.Error></code></summary>
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Put
<details><summary><code>client.endpoints.put.<a href="/src/api/resources/endpoints/resources/put/client/Client.ts">add</a>({ ...params }) -> core.APIResponse<SeedExhaustive.PutResponse, SeedExhaustive.endpoints.put.add.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.put.add({
    id: "id"
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

**request:** `SeedExhaustive.endpoints.PutRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PutClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Union
<details><summary><code>client.endpoints.union.<a href="/src/api/resources/endpoints/resources/union/client/Client.ts">getAndReturnUnion</a>({ ...params }) -> core.APIResponse<SeedExhaustive.Animal, SeedExhaustive.endpoints.union.getAndReturnUnion.Error></code></summary>
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
    likesToWoof: true
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

**requestOptions:** `UnionClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Urls
<details><summary><code>client.endpoints.urls.<a href="/src/api/resources/endpoints/resources/urls/client/Client.ts">withMixedCase</a>() -> core.APIResponse<string, SeedExhaustive.endpoints.urls.withMixedCase.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.urls.withMixedCase();

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

**requestOptions:** `UrlsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.urls.<a href="/src/api/resources/endpoints/resources/urls/client/Client.ts">noEndingSlash</a>() -> core.APIResponse<string, SeedExhaustive.endpoints.urls.noEndingSlash.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.urls.noEndingSlash();

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

**requestOptions:** `UrlsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.urls.<a href="/src/api/resources/endpoints/resources/urls/client/Client.ts">withEndingSlash</a>() -> core.APIResponse<string, SeedExhaustive.endpoints.urls.withEndingSlash.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.urls.withEndingSlash();

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

**requestOptions:** `UrlsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.urls.<a href="/src/api/resources/endpoints/resources/urls/client/Client.ts">withUnderscores</a>() -> core.APIResponse<string, SeedExhaustive.endpoints.urls.withUnderscores.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.urls.withUnderscores();

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

**requestOptions:** `UrlsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlinedRequests
<details><summary><code>client.inlinedRequests.<a href="/src/api/resources/inlinedRequests/client/Client.ts">postWithObjectBodyandResponse</a>({ ...params }) -> core.APIResponse<SeedExhaustive.ObjectWithOptionalField, SeedExhaustive.inlinedRequests.postWithObjectBodyandResponse.Error></code></summary>
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
    NestedObject: {
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
        set: ["set"],
        map: {
            1: "map"
        },
        bigint: "1000000"
    }
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

**requestOptions:** `InlinedRequestsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoAuth
<details><summary><code>client.noAuth.<a href="/src/api/resources/noAuth/client/Client.ts">postWithNoAuth</a>({ ...params }) -> core.APIResponse<boolean, SeedExhaustive.noAuth.postWithNoAuth.Error></code></summary>
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
    "key": "value"
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

**requestOptions:** `NoAuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoReqBody
<details><summary><code>client.noReqBody.<a href="/src/api/resources/noReqBody/client/Client.ts">getWithNoRequestBody</a>() -> core.APIResponse<SeedExhaustive.ObjectWithOptionalField, SeedExhaustive.noReqBody.getWithNoRequestBody.Error></code></summary>
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

**requestOptions:** `NoReqBodyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.noReqBody.<a href="/src/api/resources/noReqBody/client/Client.ts">postWithNoRequestBody</a>() -> core.APIResponse<string, SeedExhaustive.noReqBody.postWithNoRequestBody.Error></code></summary>
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

**requestOptions:** `NoReqBodyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ReqWithHeaders
<details><summary><code>client.reqWithHeaders.<a href="/src/api/resources/reqWithHeaders/client/Client.ts">getWithCustomHeader</a>({ ...params }) -> core.APIResponse<void, SeedExhaustive.reqWithHeaders.getWithCustomHeader.Error></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.reqWithHeaders.getWithCustomHeader({
    "X-TEST-SERVICE-HEADER": "X-TEST-SERVICE-HEADER",
    "X-TEST-ENDPOINT-HEADER": "X-TEST-ENDPOINT-HEADER",
    body: "string"
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

**requestOptions:** `ReqWithHeadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
