# Reference
## InlinedRequests
<details><summary><code>client.InlinedRequests.<a href="/src/SeedApi/InlinedRequests/InlinedRequestsClient.cs">PostWithObjectBodyandResponseAsync</a>(PostWithObjectBodyandResponseInlinedRequestsRequest { ... }) -> WithRawResponseTask&lt;TypesObjectWithOptionalField&gt;</code></summary>
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

```csharp
await client.InlinedRequests.PostWithObjectBodyandResponseAsync(
    new PostWithObjectBodyandResponseInlinedRequestsRequest
    {
        String = "string",
        Integer = 1,
        NestedObject = new TypesObjectWithOptionalField(),
    }
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

**request:** `PostWithObjectBodyandResponseInlinedRequestsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoAuth
<details><summary><code>client.NoAuth.<a href="/src/SeedApi/NoAuth/NoAuthClient.cs">PostWithNoAuthAsync</a>(object { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
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

```csharp
await client.NoAuth.PostWithNoAuthAsync(new Dictionary<object, object?>() { { "key", "value" } });
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

**request:** `object` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoReqBody
<details><summary><code>client.NoReqBody.<a href="/src/SeedApi/NoReqBody/NoReqBodyClient.cs">GetWithNoRequestBodyAsync</a>() -> WithRawResponseTask&lt;TypesObjectWithOptionalField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.NoReqBody.GetWithNoRequestBodyAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.NoReqBody.<a href="/src/SeedApi/NoReqBody/NoReqBodyClient.cs">PostWithNoRequestBodyAsync</a>() -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.NoReqBody.PostWithNoRequestBodyAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ReqWithHeaders
<details><summary><code>client.ReqWithHeaders.<a href="/src/SeedApi/ReqWithHeaders/ReqWithHeadersClient.cs">GetWithCustomHeaderAsync</a>(GetWithCustomHeaderReqWithHeadersRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.ReqWithHeaders.GetWithCustomHeaderAsync(
    new GetWithCustomHeaderReqWithHeadersRequest
    {
        TestEndpointHeader = "X-TEST-ENDPOINT-HEADER",
        Body = "string",
    }
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

**request:** `GetWithCustomHeaderReqWithHeadersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Container
<details><summary><code>client.Endpoints.Container.<a href="/src/SeedApi/Endpoints/Container/ContainerClient.cs">GetAndReturnListOfPrimitivesAsync</a>(IEnumerable&lt;string&gt; { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;string&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnListOfPrimitivesAsync(new List<string>() { "string" });
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

**request:** `IEnumerable<string>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="/src/SeedApi/Endpoints/Container/ContainerClient.cs">GetAndReturnListOfObjectsAsync</a>(IEnumerable&lt;TypesObjectWithRequiredField&gt; { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;TypesObjectWithRequiredField&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnListOfObjectsAsync(
    new List<TypesObjectWithRequiredField>()
    {
        new TypesObjectWithRequiredField { String = "string" },
    }
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

**request:** `IEnumerable<TypesObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="/src/SeedApi/Endpoints/Container/ContainerClient.cs">GetAndReturnSetOfPrimitivesAsync</a>(IEnumerable&lt;string&gt; { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;string&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnSetOfPrimitivesAsync(new List<string>() { "string" });
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

**request:** `IEnumerable<string>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="/src/SeedApi/Endpoints/Container/ContainerClient.cs">GetAndReturnSetOfObjectsAsync</a>(IEnumerable&lt;TypesObjectWithRequiredField&gt; { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;TypesObjectWithRequiredField&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnSetOfObjectsAsync(
    new List<TypesObjectWithRequiredField>()
    {
        new TypesObjectWithRequiredField { String = "string" },
    }
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

**request:** `IEnumerable<TypesObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="/src/SeedApi/Endpoints/Container/ContainerClient.cs">GetAndReturnMapPrimToPrimAsync</a>(Dictionary&lt;string, string&gt; { ... }) -> WithRawResponseTask&lt;Dictionary&lt;string, string&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnMapPrimToPrimAsync(
    new Dictionary<string, string>() { { "key", "value" } }
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

**request:** `Dictionary<string, string>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="/src/SeedApi/Endpoints/Container/ContainerClient.cs">GetAndReturnMapOfPrimToObjectAsync</a>(Dictionary&lt;string, TypesObjectWithRequiredField&gt; { ... }) -> WithRawResponseTask&lt;Dictionary&lt;string, TypesObjectWithRequiredField&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnMapOfPrimToObjectAsync(
    new Dictionary<string, TypesObjectWithRequiredField>()
    {
        {
            "key",
            new TypesObjectWithRequiredField { String = "string" }
        },
    }
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

**request:** `Dictionary<string, TypesObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="/src/SeedApi/Endpoints/Container/ContainerClient.cs">GetAndReturnMapOfPrimToUndiscriminatedUnionAsync</a>(Dictionary&lt;string, OneOf&lt;double, bool, string, IEnumerable&lt;string&gt;&gt;&gt; { ... }) -> WithRawResponseTask&lt;Dictionary&lt;string, OneOf&lt;double, bool, string, IEnumerable&lt;string&gt;&gt;&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
    new Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>() { { "key", 1.1 } }
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

**request:** `Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="/src/SeedApi/Endpoints/Container/ContainerClient.cs">GetAndReturnOptionalAsync</a>(TypesObjectWithRequiredField { ... }) -> WithRawResponseTask&lt;TypesObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnOptionalAsync(
    new TypesObjectWithRequiredField { String = "string" }
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

**request:** `TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints ContentType
<details><summary><code>client.Endpoints.ContentType.<a href="/src/SeedApi/Endpoints/ContentType/ContentTypeClient.cs">PostJsonPatchContentTypeAsync</a>(TypesObjectWithOptionalField { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.ContentType.PostJsonPatchContentTypeAsync(
    new TypesObjectWithOptionalField()
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

**request:** `TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.ContentType.<a href="/src/SeedApi/Endpoints/ContentType/ContentTypeClient.cs">PostJsonPatchContentWithCharsetTypeAsync</a>(TypesObjectWithOptionalField { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.ContentType.PostJsonPatchContentWithCharsetTypeAsync(
    new TypesObjectWithOptionalField()
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

**request:** `TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Enum
<details><summary><code>client.Endpoints.Enum.<a href="/src/SeedApi/Endpoints/Enum/EnumClient.cs">GetAndReturnEnumAsync</a>(TypesWeatherReport { ... }) -> WithRawResponseTask&lt;TypesWeatherReport&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Enum.GetAndReturnEnumAsync(TypesWeatherReport.Sunny);
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

**request:** `TypesWeatherReport` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints HttpMethods
<details><summary><code>client.Endpoints.HttpMethods.<a href="/src/SeedApi/Endpoints/HttpMethods/HttpMethodsClient.cs">TestGetAsync</a>(TestGetHttpMethodsRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestGetAsync(new TestGetHttpMethodsRequest { Id = "id" });
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

**request:** `TestGetHttpMethodsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HttpMethods.<a href="/src/SeedApi/Endpoints/HttpMethods/HttpMethodsClient.cs">TestPutAsync</a>(TestPutHttpMethodsRequest { ... }) -> WithRawResponseTask&lt;TypesObjectWithOptionalField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestPutAsync(
    new TestPutHttpMethodsRequest
    {
        Id = "id",
        Body = new TypesObjectWithRequiredField { String = "string" },
    }
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

**request:** `TestPutHttpMethodsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HttpMethods.<a href="/src/SeedApi/Endpoints/HttpMethods/HttpMethodsClient.cs">TestDeleteAsync</a>(TestDeleteHttpMethodsRequest { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestDeleteAsync(new TestDeleteHttpMethodsRequest { Id = "id" });
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

**request:** `TestDeleteHttpMethodsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HttpMethods.<a href="/src/SeedApi/Endpoints/HttpMethods/HttpMethodsClient.cs">TestPatchAsync</a>(TestPatchHttpMethodsRequest { ... }) -> WithRawResponseTask&lt;TypesObjectWithOptionalField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestPatchAsync(
    new TestPatchHttpMethodsRequest { Id = "id", Body = new TypesObjectWithOptionalField() }
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

**request:** `TestPatchHttpMethodsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HttpMethods.<a href="/src/SeedApi/Endpoints/HttpMethods/HttpMethodsClient.cs">TestPostAsync</a>(TypesObjectWithRequiredField { ... }) -> WithRawResponseTask&lt;TypesObjectWithOptionalField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestPostAsync(
    new TypesObjectWithRequiredField { String = "string" }
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

**request:** `TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Object
<details><summary><code>client.Endpoints.Object.<a href="/src/SeedApi/Endpoints/Object/ObjectClient.cs">GetAndReturnWithOptionalFieldAsync</a>(TypesObjectWithOptionalField { ... }) -> WithRawResponseTask&lt;TypesObjectWithOptionalField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnWithOptionalFieldAsync(
    new TypesObjectWithOptionalField()
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

**request:** `TypesObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedApi/Endpoints/Object/ObjectClient.cs">GetAndReturnWithRequiredFieldAsync</a>(TypesObjectWithRequiredField { ... }) -> WithRawResponseTask&lt;TypesObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnWithRequiredFieldAsync(
    new TypesObjectWithRequiredField { String = "string" }
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

**request:** `TypesObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedApi/Endpoints/Object/ObjectClient.cs">GetAndReturnWithMapOfMapAsync</a>(TypesObjectWithMapOfMap { ... }) -> WithRawResponseTask&lt;TypesObjectWithMapOfMap&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnWithMapOfMapAsync(
    new TypesObjectWithMapOfMap
    {
        Map = new Dictionary<string, Dictionary<string, string>>()
        {
            {
                "key",
                new Dictionary<string, string>() { { "key", "value" } }
            },
        },
    }
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

**request:** `TypesObjectWithMapOfMap` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedApi/Endpoints/Object/ObjectClient.cs">GetAndReturnNestedWithOptionalFieldAsync</a>(TypesNestedObjectWithOptionalField { ... }) -> WithRawResponseTask&lt;TypesNestedObjectWithOptionalField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnNestedWithOptionalFieldAsync(
    new TypesNestedObjectWithOptionalField()
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

**request:** `TypesNestedObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedApi/Endpoints/Object/ObjectClient.cs">GetAndReturnNestedWithRequiredFieldAsync</a>(GetAndReturnNestedWithRequiredFieldObjectRequest { ... }) -> WithRawResponseTask&lt;TypesNestedObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsync(
    new GetAndReturnNestedWithRequiredFieldObjectRequest
    {
        StringValue = "string",
        Body = new TypesNestedObjectWithRequiredField
        {
            String = "string",
            NestedObject = new TypesObjectWithOptionalField(),
        },
    }
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

**request:** `GetAndReturnNestedWithRequiredFieldObjectRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedApi/Endpoints/Object/ObjectClient.cs">GetAndReturnNestedWithRequiredFieldAsListAsync</a>(IEnumerable&lt;TypesNestedObjectWithRequiredField&gt; { ... }) -> WithRawResponseTask&lt;TypesNestedObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsListAsync(
    new List<TypesNestedObjectWithRequiredField>()
    {
        new TypesNestedObjectWithRequiredField
        {
            String = "string",
            NestedObject = new TypesObjectWithOptionalField(),
        },
    }
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

**request:** `IEnumerable<TypesNestedObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedApi/Endpoints/Object/ObjectClient.cs">GetAndReturnWithUnknownFieldAsync</a>(TypesObjectWithUnknownField { ... }) -> WithRawResponseTask&lt;TypesObjectWithUnknownField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnWithUnknownFieldAsync(
    new TypesObjectWithUnknownField
    {
        Unknown = new Dictionary<object, object?>() { { "key", "value" } },
    }
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

**request:** `TypesObjectWithUnknownField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedApi/Endpoints/Object/ObjectClient.cs">GetAndReturnWithDocumentedUnknownTypeAsync</a>(TypesObjectWithDocumentedUnknownType { ... }) -> WithRawResponseTask&lt;TypesObjectWithDocumentedUnknownType&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnWithDocumentedUnknownTypeAsync(
    new TypesObjectWithDocumentedUnknownType
    {
        DocumentedUnknownType = new Dictionary<object, object?>() { { "key", "value" } },
    }
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

**request:** `TypesObjectWithDocumentedUnknownType` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedApi/Endpoints/Object/ObjectClient.cs">GetAndReturnMapOfDocumentedUnknownTypeAsync</a>(Dictionary&lt;string, object?&gt; { ... }) -> WithRawResponseTask&lt;Dictionary&lt;string, object?&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnMapOfDocumentedUnknownTypeAsync(
    new Dictionary<string, object>() { }
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

**request:** `Dictionary<string, object?>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedApi/Endpoints/Object/ObjectClient.cs">GetAndReturnWithDatetimeLikeStringAsync</a>(TypesObjectWithDatetimeLikeString { ... }) -> WithRawResponseTask&lt;TypesObjectWithDatetimeLikeString&gt;</code></summary>
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

```csharp
await client.Endpoints.Object.GetAndReturnWithDatetimeLikeStringAsync(
    new TypesObjectWithDatetimeLikeString
    {
        DatetimeLikeString = "datetimeLikeString",
        ActualDatetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
    }
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

**request:** `TypesObjectWithDatetimeLikeString` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Pagination
<details><summary><code>client.Endpoints.Pagination.<a href="/src/SeedApi/Endpoints/Pagination/PaginationClient.cs">ListItemsAsync</a>(ListItemsPaginationRequest { ... }) -> WithRawResponseTask&lt;EndpointsPaginatedResponse&gt;</code></summary>
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

```csharp
await client.Endpoints.Pagination.ListItemsAsync(new ListItemsPaginationRequest());
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

**request:** `ListItemsPaginationRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Params
<details><summary><code>client.Endpoints.Params.<a href="/src/SeedApi/Endpoints/Params/ParamsClient.cs">GetWithPathAsync</a>(GetWithPathParamsRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
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

```csharp
await client.Endpoints.Params.GetWithPathAsync(new GetWithPathParamsRequest { Param = "param" });
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

**request:** `GetWithPathParamsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedApi/Endpoints/Params/ParamsClient.cs">ModifyWithPathAsync</a>(ModifyWithPathParamsRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
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

```csharp
await client.Endpoints.Params.ModifyWithPathAsync(
    new ModifyWithPathParamsRequest { Param = "param", Body = "string" }
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

**request:** `ModifyWithPathParamsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedApi/Endpoints/Params/ParamsClient.cs">GetWithInlinePathAsync</a>(GetWithInlinePathParamsRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
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

```csharp
await client.Endpoints.Params.GetWithInlinePathAsync(
    new GetWithInlinePathParamsRequest { Param = "param" }
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

**request:** `GetWithInlinePathParamsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedApi/Endpoints/Params/ParamsClient.cs">ModifyWithInlinePathAsync</a>(ModifyWithInlinePathParamsRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
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

```csharp
await client.Endpoints.Params.ModifyWithInlinePathAsync(
    new ModifyWithInlinePathParamsRequest { Param = "param", Body = "string" }
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

**request:** `ModifyWithInlinePathParamsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedApi/Endpoints/Params/ParamsClient.cs">GetWithQueryAsync</a>(GetWithQueryParamsRequest { ... })</code></summary>
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

```csharp
await client.Endpoints.Params.GetWithQueryAsync(
    new GetWithQueryParamsRequest { Query = "query", Number = 1 }
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

**request:** `GetWithQueryParamsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedApi/Endpoints/Params/ParamsClient.cs">GetWithAllowMultipleQueryAsync</a>(GetWithAllowMultipleQueryParamsRequest { ... })</code></summary>
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

```csharp
await client.Endpoints.Params.GetWithAllowMultipleQueryAsync(
    new GetWithAllowMultipleQueryParamsRequest
    {
        Query = new List<string>() { "query" },
        Number = new List<int>() { 1 },
    }
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

**request:** `GetWithAllowMultipleQueryParamsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedApi/Endpoints/Params/ParamsClient.cs">GetWithPathAndQueryAsync</a>(GetWithPathAndQueryParamsRequest { ... })</code></summary>
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

```csharp
await client.Endpoints.Params.GetWithPathAndQueryAsync(
    new GetWithPathAndQueryParamsRequest { Param = "param", Query = "query" }
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

**request:** `GetWithPathAndQueryParamsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedApi/Endpoints/Params/ParamsClient.cs">GetWithInlinePathAndQueryAsync</a>(GetWithInlinePathAndQueryParamsRequest { ... })</code></summary>
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

```csharp
await client.Endpoints.Params.GetWithInlinePathAndQueryAsync(
    new GetWithInlinePathAndQueryParamsRequest { Param = "param", Query = "query" }
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

**request:** `GetWithInlinePathAndQueryParamsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Primitive
<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedApi/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnStringAsync</a>(string { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Primitive.GetAndReturnStringAsync("string");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedApi/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnIntAsync</a>(int { ... }) -> WithRawResponseTask&lt;int&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Primitive.GetAndReturnIntAsync(1);
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

**request:** `int` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedApi/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnLongAsync</a>(long { ... }) -> WithRawResponseTask&lt;long&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Primitive.GetAndReturnLongAsync(1000000);
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

**request:** `long` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedApi/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnDoubleAsync</a>(double { ... }) -> WithRawResponseTask&lt;double&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Primitive.GetAndReturnDoubleAsync(1.1);
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

**request:** `double` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedApi/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnBoolAsync</a>(bool { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Primitive.GetAndReturnBoolAsync(true);
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

**request:** `bool` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedApi/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnDatetimeAsync</a>(DateTime { ... }) -> WithRawResponseTask&lt;DateTime&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Primitive.GetAndReturnDatetimeAsync(
    new DateTime(2024, 01, 15, 09, 30, 00, 000)
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

**request:** `DateTime` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedApi/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnDateAsync</a>(DateOnly { ... }) -> WithRawResponseTask&lt;DateOnly&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Primitive.GetAndReturnDateAsync(new DateOnly(2023, 1, 15));
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

**request:** `DateOnly` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedApi/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnUuidAsync</a>(string { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Primitive.GetAndReturnUuidAsync("string");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedApi/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnBase64Async</a>(string { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Primitive.GetAndReturnBase64Async("string");
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
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Put
<details><summary><code>client.Endpoints.Put.<a href="/src/SeedApi/Endpoints/Put/PutClient.cs">AddAsync</a>(AddPutRequest { ... }) -> WithRawResponseTask&lt;EndpointsPutResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Put.AddAsync(new AddPutRequest { Id = "id" });
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

**request:** `AddPutRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Union
<details><summary><code>client.Endpoints.Union.<a href="/src/SeedApi/Endpoints/Union/UnionClient.cs">GetAndReturnUnionAsync</a>(OneOf&lt;TypesAnimalZero, TypesAnimalOne&gt; { ... }) -> WithRawResponseTask&lt;OneOf&lt;TypesAnimalZero, TypesAnimalOne&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Union.GetAndReturnUnionAsync(
    new TypesAnimalZero
    {
        Name = "name",
        LikesToWoof = true,
        Animal = TypesAnimalZeroAnimal.Dog,
    }
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

**request:** `OneOf<TypesAnimalZero, TypesAnimalOne>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Urls
<details><summary><code>client.Endpoints.Urls.<a href="/src/SeedApi/Endpoints/Urls/UrlsClient.cs">WithMixedCaseAsync</a>() -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Urls.WithMixedCaseAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Urls.<a href="/src/SeedApi/Endpoints/Urls/UrlsClient.cs">NoEndingSlashAsync</a>() -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Urls.NoEndingSlashAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Urls.<a href="/src/SeedApi/Endpoints/Urls/UrlsClient.cs">WithEndingSlashAsync</a>() -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Urls.WithEndingSlashAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Urls.<a href="/src/SeedApi/Endpoints/Urls/UrlsClient.cs">WithUnderscoresAsync</a>() -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Urls.WithUnderscoresAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

