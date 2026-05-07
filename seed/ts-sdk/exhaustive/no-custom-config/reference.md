# Reference
## Inlinedrequests
<details><summary><code>client.inlinedrequests.<a href="/src/api/resources/inlinedrequests/client/Client.ts">postwithobjectbodyandresponse</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
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
await client.inlinedrequests.postwithobjectbodyandresponse({
    string: "string",
    integer: 1,
    NestedObject: {}
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

**request:** `SeedApi.PostwithobjectbodyandresponseInlinedrequestsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InlinedrequestsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Noauth
<details><summary><code>client.noauth.<a href="/src/api/resources/noauth/client/Client.ts">postwithnoauth</a>({ ...params }) -> boolean</code></summary>
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
await client.noauth.postwithnoauth({
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

**requestOptions:** `NoauthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Noreqbody
<details><summary><code>client.noreqbody.<a href="/src/api/resources/noreqbody/client/Client.ts">getwithnorequestbody</a>() -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.noreqbody.getwithnorequestbody();

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

**requestOptions:** `NoreqbodyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.noreqbody.<a href="/src/api/resources/noreqbody/client/Client.ts">postwithnorequestbody</a>() -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.noreqbody.postwithnorequestbody();

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

**requestOptions:** `NoreqbodyClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reqwithheaders
<details><summary><code>client.reqwithheaders.<a href="/src/api/resources/reqwithheaders/client/Client.ts">getwithcustomheader</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.reqwithheaders.getwithcustomheader({
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

**request:** `SeedApi.GetwithcustomheaderReqwithheadersRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ReqwithheadersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

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
await client.endpoints.container.getAndReturnListOfPrimitives(["string"]);

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

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnListOfObjects</a>({ ...params }) -> SeedApi.TypesObjectWithRequiredField[]</code></summary>
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

**request:** `SeedApi.TypesObjectWithRequiredField[]` 
    
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

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnSetOfPrimitives</a>({ ...params }) -> string[]</code></summary>
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

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnSetOfObjects</a>({ ...params }) -> SeedApi.TypesObjectWithRequiredField[]</code></summary>
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

**request:** `SeedApi.TypesObjectWithRequiredField[]` 
    
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

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnMapPrimToPrim</a>({ ...params }) -> Record&lt;string, string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnMapPrimToPrim({
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

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnMapOfPrimToObject</a>({ ...params }) -> Record&lt;string, SeedApi.TypesObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnMapOfPrimToObject({
    "key": {
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

**request:** `Record<string, SeedApi.TypesObjectWithRequiredField>` 
    
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

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnMapOfPrimToUndiscriminatedUnion</a>({ ...params }) -> Record&lt;string, SeedApi.TypesMixedType&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.container.getAndReturnMapOfPrimToUndiscriminatedUnion({
    "key": 1.1
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

**request:** `Record<string, SeedApi.TypesMixedType>` 
    
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

<details><summary><code>client.endpoints.container.<a href="/src/api/resources/endpoints/resources/container/client/Client.ts">getAndReturnOptional</a>({ ...params }) -> SeedApi.TypesObjectWithRequiredField</code></summary>
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

**request:** `SeedApi.TypesObjectWithRequiredField` 
    
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
<details><summary><code>client.endpoints.contentType.<a href="/src/api/resources/endpoints/resources/contentType/client/Client.ts">contentTypePostJsonPatchContentType</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.contentType.contentTypePostJsonPatchContentType({});

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

**request:** `SeedApi.TypesObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints.contentType.<a href="/src/api/resources/endpoints/resources/contentType/client/Client.ts">contentTypePostJsonPatchContentWithCharsetType</a>({ ...params }) -> void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.contentType.contentTypePostJsonPatchContentWithCharsetType({});

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

**request:** `SeedApi.TypesObjectWithOptionalField` 
    
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
<details><summary><code>client.endpoints.enum.<a href="/src/api/resources/endpoints/resources/enum/client/Client.ts">getAndReturnEnum</a>({ ...params }) -> SeedApi.TypesWeatherReport</code></summary>
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

**request:** `SeedApi.TypesWeatherReport` 
    
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
<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">httpMethodsTestGet</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.httpMethods.httpMethodsTestGet({
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

**request:** `SeedApi.endpoints.HttpMethodsTestGetHttpMethodsRequest` 
    
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

<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">httpMethodsTestPut</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.httpMethods.httpMethodsTestPut({
    id: "id",
    body: {
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

**request:** `SeedApi.endpoints.HttpMethodsTestPutHttpMethodsRequest` 
    
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

<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">httpMethodsTestDelete</a>({ ...params }) -> boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.httpMethods.httpMethodsTestDelete({
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

**request:** `SeedApi.endpoints.HttpMethodsTestDeleteHttpMethodsRequest` 
    
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

<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">httpMethodsTestPatch</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.httpMethods.httpMethodsTestPatch({
    id: "id",
    body: {}
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

**request:** `SeedApi.endpoints.HttpMethodsTestPatchHttpMethodsRequest` 
    
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

<details><summary><code>client.endpoints.httpMethods.<a href="/src/api/resources/endpoints/resources/httpMethods/client/Client.ts">httpMethodsTestPost</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.httpMethods.httpMethodsTestPost({
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

**request:** `SeedApi.TypesObjectWithRequiredField` 
    
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
<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithOptionalField</a>({ ...params }) -> SeedApi.TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnWithOptionalField({});

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

**request:** `SeedApi.TypesObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithRequiredField</a>({ ...params }) -> SeedApi.TypesObjectWithRequiredField</code></summary>
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

**request:** `SeedApi.TypesObjectWithRequiredField` 
    
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

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithMapOfMap</a>({ ...params }) -> SeedApi.TypesObjectWithMapOfMap</code></summary>
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
        "key": {
            "key": "value"
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

**request:** `SeedApi.TypesObjectWithMapOfMap` 
    
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

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithOptionalField</a>({ ...params }) -> SeedApi.TypesNestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnNestedWithOptionalField({});

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

**request:** `SeedApi.TypesNestedObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithRequiredField</a>({ ...params }) -> SeedApi.TypesNestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnNestedWithRequiredField({
    string: "string",
    body: {
        string: "string",
        NestedObject: {}
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

**request:** `SeedApi.endpoints.GetAndReturnNestedWithRequiredFieldObjectRequest` 
    
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

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnNestedWithRequiredFieldAsList</a>({ ...params }) -> SeedApi.TypesNestedObjectWithRequiredField</code></summary>
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
        NestedObject: {}
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

**request:** `SeedApi.TypesNestedObjectWithRequiredField[]` 
    
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

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithUnknownField</a>({ ...params }) -> SeedApi.TypesObjectWithUnknownField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnWithUnknownField({
    unknown: {
        "key": "value"
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

**request:** `SeedApi.TypesObjectWithUnknownField` 
    
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

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithDocumentedUnknownType</a>({ ...params }) -> SeedApi.TypesObjectWithDocumentedUnknownType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnWithDocumentedUnknownType({
    documentedUnknownType: {
        "key": "value"
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

**request:** `SeedApi.TypesObjectWithDocumentedUnknownType` 
    
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

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnMapOfDocumentedUnknownType</a>({ ...params }) -> SeedApi.TypesMapOfDocumentedUnknownType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.object.getAndReturnMapOfDocumentedUnknownType({});

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

**request:** `SeedApi.TypesMapOfDocumentedUnknownType` 
    
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

<details><summary><code>client.endpoints.object.<a href="/src/api/resources/endpoints/resources/object/client/Client.ts">getAndReturnWithDatetimeLikeString</a>({ ...params }) -> SeedApi.TypesObjectWithDatetimeLikeString</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that string fields containing datetime-like values are NOT reformatted.
The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
without being converted to "2023-08-31T14:15:22.000Z".
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
await client.endpoints.object.getAndReturnWithDatetimeLikeString({
    datetimeLikeString: "datetimeLikeString",
    actualDatetime: "2024-01-15T09:30:00Z"
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

**request:** `SeedApi.TypesObjectWithDatetimeLikeString` 
    
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

## Endpoints Pagination
<details><summary><code>client.endpoints.pagination.<a href="/src/api/resources/endpoints/resources/pagination/client/Client.ts">listItems</a>({ ...params }) -> SeedApi.EndpointsPaginatedResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List items with cursor pagination
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
await client.endpoints.pagination.listItems();

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

**request:** `SeedApi.endpoints.ListItemsPaginationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `PaginationClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Params
<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithPath</a>({ ...params }) -> string</code></summary>
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
await client.endpoints.params.getWithPath({
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

**request:** `SeedApi.endpoints.GetWithPathParamsRequest` 
    
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

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">modifyWithPath</a>({ ...params }) -> string</code></summary>
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
await client.endpoints.params.modifyWithPath({
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

**request:** `SeedApi.endpoints.ModifyWithPathParamsRequest` 
    
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

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithInlinePath</a>({ ...params }) -> string</code></summary>
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

**request:** `SeedApi.endpoints.GetWithInlinePathParamsRequest` 
    
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

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">modifyWithInlinePath</a>({ ...params }) -> string</code></summary>
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

**request:** `SeedApi.endpoints.ModifyWithInlinePathParamsRequest` 
    
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

**request:** `SeedApi.endpoints.GetWithQueryParamsRequest` 
    
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

**request:** `SeedApi.endpoints.GetWithAllowMultipleQueryParamsRequest` 
    
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

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithPathAndQuery</a>({ ...params }) -> void</code></summary>
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
await client.endpoints.params.getWithPathAndQuery({
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

**request:** `SeedApi.endpoints.GetWithPathAndQueryParamsRequest` 
    
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

<details><summary><code>client.endpoints.params.<a href="/src/api/resources/endpoints/resources/params/client/Client.ts">getWithInlinePathAndQuery</a>({ ...params }) -> void</code></summary>
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

**request:** `SeedApi.endpoints.GetWithInlinePathAndQueryParamsRequest` 
    
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnDatetime</a>({ ...params }) -> string</code></summary>
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

**requestOptions:** `PrimitiveClient.RequestOptions` 
    
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
await client.endpoints.primitive.getAndReturnUuid("string");

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

<details><summary><code>client.endpoints.primitive.<a href="/src/api/resources/endpoints/resources/primitive/client/Client.ts">getAndReturnBase64</a>({ ...params }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.primitive.getAndReturnBase64("string");

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
<details><summary><code>client.endpoints.put.<a href="/src/api/resources/endpoints/resources/put/client/Client.ts">endpointsPutAdd</a>({ ...params }) -> SeedApi.EndpointsPutResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.put.endpointsPutAdd({
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

**request:** `SeedApi.endpoints.EndpointsPutAddPutRequest` 
    
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
<details><summary><code>client.endpoints.union.<a href="/src/api/resources/endpoints/resources/union/client/Client.ts">getAndReturnUnion</a>({ ...params }) -> SeedApi.TypesAnimal</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.endpoints.union.getAndReturnUnion({
    name: "name",
    likesToWoof: true,
    animal: "dog"
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

**request:** `SeedApi.TypesAnimal` 
    
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
<details><summary><code>client.endpoints.urls.<a href="/src/api/resources/endpoints/resources/urls/client/Client.ts">withMixedCase</a>() -> string</code></summary>
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

<details><summary><code>client.endpoints.urls.<a href="/src/api/resources/endpoints/resources/urls/client/Client.ts">noEndingSlash</a>() -> string</code></summary>
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

<details><summary><code>client.endpoints.urls.<a href="/src/api/resources/endpoints/resources/urls/client/Client.ts">withEndingSlash</a>() -> string</code></summary>
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

<details><summary><code>client.endpoints.urls.<a href="/src/api/resources/endpoints/resources/urls/client/Client.ts">withUnderscores</a>() -> string</code></summary>
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

