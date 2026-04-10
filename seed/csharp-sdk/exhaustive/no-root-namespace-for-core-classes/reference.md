# Reference
## EndpointsContainer
<details><summary><code>client.EndpointsContainer.<a href="/src/SeedApi/EndpointsContainer/EndpointsContainerClient.cs">EndpointsContainerGetAndReturnListOfPrimitivesAsync</a>(IEnumerable&lt;string&gt; { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;string&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsContainer.EndpointsContainerGetAndReturnListOfPrimitivesAsync(
    new List<string>() { "string" }
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

**request:** `IEnumerable<string>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsContainer.<a href="/src/SeedApi/EndpointsContainer/EndpointsContainerClient.cs">EndpointsContainerGetAndReturnListOfObjectsAsync</a>(IEnumerable&lt;TypesObjectWithRequiredField&gt; { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;TypesObjectWithRequiredField&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsContainer.EndpointsContainerGetAndReturnListOfObjectsAsync(
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

<details><summary><code>client.EndpointsContainer.<a href="/src/SeedApi/EndpointsContainer/EndpointsContainerClient.cs">EndpointsContainerGetAndReturnSetOfPrimitivesAsync</a>(IEnumerable&lt;string&gt; { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;string&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsContainer.EndpointsContainerGetAndReturnSetOfPrimitivesAsync(
    new List<string>() { "string" }
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

**request:** `IEnumerable<string>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsContainer.<a href="/src/SeedApi/EndpointsContainer/EndpointsContainerClient.cs">EndpointsContainerGetAndReturnSetOfObjectsAsync</a>(IEnumerable&lt;TypesObjectWithRequiredField&gt; { ... }) -> WithRawResponseTask&lt;IEnumerable&lt;TypesObjectWithRequiredField&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsContainer.EndpointsContainerGetAndReturnSetOfObjectsAsync(
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

<details><summary><code>client.EndpointsContainer.<a href="/src/SeedApi/EndpointsContainer/EndpointsContainerClient.cs">EndpointsContainerGetAndReturnMapPrimToPrimAsync</a>(Dictionary&lt;string, string&gt; { ... }) -> WithRawResponseTask&lt;Dictionary&lt;string, string&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsContainer.EndpointsContainerGetAndReturnMapPrimToPrimAsync(
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

<details><summary><code>client.EndpointsContainer.<a href="/src/SeedApi/EndpointsContainer/EndpointsContainerClient.cs">EndpointsContainerGetAndReturnMapOfPrimToObjectAsync</a>(Dictionary&lt;string, TypesObjectWithRequiredField&gt; { ... }) -> WithRawResponseTask&lt;Dictionary&lt;string, TypesObjectWithRequiredField&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToObjectAsync(
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

<details><summary><code>client.EndpointsContainer.<a href="/src/SeedApi/EndpointsContainer/EndpointsContainerClient.cs">EndpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnionAsync</a>(Dictionary&lt;string, OneOf&lt;double, bool, string, IEnumerable&lt;string&gt;&gt;&gt; { ... }) -> WithRawResponseTask&lt;Dictionary&lt;string, OneOf&lt;double, bool, string, IEnumerable&lt;string&gt;&gt;&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
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

<details><summary><code>client.EndpointsContainer.<a href="/src/SeedApi/EndpointsContainer/EndpointsContainerClient.cs">EndpointsContainerGetAndReturnOptionalAsync</a>(TypesObjectWithRequiredField { ... }) -> WithRawResponseTask&lt;TypesObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsContainer.EndpointsContainerGetAndReturnOptionalAsync(
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

## EndpointsContentType
<details><summary><code>client.EndpointsContentType.<a href="/src/SeedApi/EndpointsContentType/EndpointsContentTypeClient.cs">EndpointsContentTypePostJsonPatchContentTypeAsync</a>(TypesObjectWithOptionalField { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsContentType.EndpointsContentTypePostJsonPatchContentTypeAsync(
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

<details><summary><code>client.EndpointsContentType.<a href="/src/SeedApi/EndpointsContentType/EndpointsContentTypeClient.cs">EndpointsContentTypePostJsonPatchContentWithCharsetTypeAsync</a>(TypesObjectWithOptionalField { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsContentType.EndpointsContentTypePostJsonPatchContentWithCharsetTypeAsync(
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

## EndpointsEnum
<details><summary><code>client.EndpointsEnum.<a href="/src/SeedApi/EndpointsEnum/EndpointsEnumClient.cs">EndpointsEnumGetAndReturnEnumAsync</a>(TypesWeatherReport { ... }) -> WithRawResponseTask&lt;TypesWeatherReport&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsEnum.EndpointsEnumGetAndReturnEnumAsync(TypesWeatherReport.Sunny);
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

## EndpointsHttpMethods
<details><summary><code>client.EndpointsHttpMethods.<a href="/src/SeedApi/EndpointsHttpMethods/EndpointsHttpMethodsClient.cs">EndpointsHttpMethodsTestGetAsync</a>(EndpointsHttpMethodsTestGetRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsHttpMethods.EndpointsHttpMethodsTestGetAsync(
    new EndpointsHttpMethodsTestGetRequest { Id = "id" }
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

**request:** `EndpointsHttpMethodsTestGetRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsHttpMethods.<a href="/src/SeedApi/EndpointsHttpMethods/EndpointsHttpMethodsClient.cs">EndpointsHttpMethodsTestPutAsync</a>(EndpointsHttpMethodsTestPutRequest { ... }) -> WithRawResponseTask&lt;TypesObjectWithOptionalField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsHttpMethods.EndpointsHttpMethodsTestPutAsync(
    new EndpointsHttpMethodsTestPutRequest
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

**request:** `EndpointsHttpMethodsTestPutRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsHttpMethods.<a href="/src/SeedApi/EndpointsHttpMethods/EndpointsHttpMethodsClient.cs">EndpointsHttpMethodsTestDeleteAsync</a>(EndpointsHttpMethodsTestDeleteRequest { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsHttpMethods.EndpointsHttpMethodsTestDeleteAsync(
    new EndpointsHttpMethodsTestDeleteRequest { Id = "id" }
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

**request:** `EndpointsHttpMethodsTestDeleteRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsHttpMethods.<a href="/src/SeedApi/EndpointsHttpMethods/EndpointsHttpMethodsClient.cs">EndpointsHttpMethodsTestPatchAsync</a>(EndpointsHttpMethodsTestPatchRequest { ... }) -> WithRawResponseTask&lt;TypesObjectWithOptionalField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsHttpMethods.EndpointsHttpMethodsTestPatchAsync(
    new EndpointsHttpMethodsTestPatchRequest
    {
        Id = "id",
        Body = new TypesObjectWithOptionalField(),
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

**request:** `EndpointsHttpMethodsTestPatchRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsHttpMethods.<a href="/src/SeedApi/EndpointsHttpMethods/EndpointsHttpMethodsClient.cs">EndpointsHttpMethodsTestPostAsync</a>(TypesObjectWithRequiredField { ... }) -> WithRawResponseTask&lt;TypesObjectWithOptionalField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsHttpMethods.EndpointsHttpMethodsTestPostAsync(
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

## EndpointsObject
<details><summary><code>client.EndpointsObject.<a href="/src/SeedApi/EndpointsObject/EndpointsObjectClient.cs">EndpointsObjectGetAndReturnWithOptionalFieldAsync</a>(TypesObjectWithOptionalField { ... }) -> WithRawResponseTask&lt;TypesObjectWithOptionalField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsObject.EndpointsObjectGetAndReturnWithOptionalFieldAsync(
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

<details><summary><code>client.EndpointsObject.<a href="/src/SeedApi/EndpointsObject/EndpointsObjectClient.cs">EndpointsObjectGetAndReturnWithRequiredFieldAsync</a>(TypesObjectWithRequiredField { ... }) -> WithRawResponseTask&lt;TypesObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsObject.EndpointsObjectGetAndReturnWithRequiredFieldAsync(
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

<details><summary><code>client.EndpointsObject.<a href="/src/SeedApi/EndpointsObject/EndpointsObjectClient.cs">EndpointsObjectGetAndReturnWithMapOfMapAsync</a>(TypesObjectWithMapOfMap { ... }) -> WithRawResponseTask&lt;TypesObjectWithMapOfMap&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsObject.EndpointsObjectGetAndReturnWithMapOfMapAsync(
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

<details><summary><code>client.EndpointsObject.<a href="/src/SeedApi/EndpointsObject/EndpointsObjectClient.cs">EndpointsObjectGetAndReturnNestedWithOptionalFieldAsync</a>(TypesNestedObjectWithOptionalField { ... }) -> WithRawResponseTask&lt;TypesNestedObjectWithOptionalField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithOptionalFieldAsync(
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

<details><summary><code>client.EndpointsObject.<a href="/src/SeedApi/EndpointsObject/EndpointsObjectClient.cs">EndpointsObjectGetAndReturnNestedWithRequiredFieldAsync</a>(EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest { ... }) -> WithRawResponseTask&lt;TypesNestedObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithRequiredFieldAsync(
    new EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest
    {
        String = "string",
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

**request:** `EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.<a href="/src/SeedApi/EndpointsObject/EndpointsObjectClient.cs">EndpointsObjectGetAndReturnNestedWithRequiredFieldAsListAsync</a>(IEnumerable&lt;TypesNestedObjectWithRequiredField&gt; { ... }) -> WithRawResponseTask&lt;TypesNestedObjectWithRequiredField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithRequiredFieldAsListAsync(
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

<details><summary><code>client.EndpointsObject.<a href="/src/SeedApi/EndpointsObject/EndpointsObjectClient.cs">EndpointsObjectGetAndReturnWithUnknownFieldAsync</a>(TypesObjectWithUnknownField { ... }) -> WithRawResponseTask&lt;TypesObjectWithUnknownField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsObject.EndpointsObjectGetAndReturnWithUnknownFieldAsync(
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

<details><summary><code>client.EndpointsObject.<a href="/src/SeedApi/EndpointsObject/EndpointsObjectClient.cs">EndpointsObjectGetAndReturnWithDocumentedUnknownTypeAsync</a>(TypesObjectWithDocumentedUnknownType { ... }) -> WithRawResponseTask&lt;TypesObjectWithDocumentedUnknownType&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsObject.EndpointsObjectGetAndReturnWithDocumentedUnknownTypeAsync(
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

<details><summary><code>client.EndpointsObject.<a href="/src/SeedApi/EndpointsObject/EndpointsObjectClient.cs">EndpointsObjectGetAndReturnMapOfDocumentedUnknownTypeAsync</a>(Dictionary&lt;string, object?&gt; { ... }) -> WithRawResponseTask&lt;Dictionary&lt;string, object?&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsObject.EndpointsObjectGetAndReturnMapOfDocumentedUnknownTypeAsync(
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

<details><summary><code>client.EndpointsObject.<a href="/src/SeedApi/EndpointsObject/EndpointsObjectClient.cs">EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFieldsAsync</a>(TypesObjectWithMixedRequiredAndOptionalFields { ... }) -> WithRawResponseTask&lt;TypesObjectWithMixedRequiredAndOptionalFields&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that dynamic snippets include all required properties in the
object initializer, even when the example omits some required fields.
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
await client.EndpointsObject.EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFieldsAsync(
    new TypesObjectWithMixedRequiredAndOptionalFields
    {
        RequiredString = "requiredString",
        RequiredInteger = 1,
        RequiredLong = 1000000,
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

**request:** `TypesObjectWithMixedRequiredAndOptionalFields` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.<a href="/src/SeedApi/EndpointsObject/EndpointsObjectClient.cs">EndpointsObjectGetAndReturnWithRequiredNestedObjectAsync</a>(TypesObjectWithRequiredNestedObject { ... }) -> WithRawResponseTask&lt;TypesObjectWithRequiredNestedObject&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that dynamic snippets recursively construct default objects for
required properties whose type is a named object. When the example
omits the nested object, the generator should construct a default
initializer with the nested object's required properties filled in.
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
await client.EndpointsObject.EndpointsObjectGetAndReturnWithRequiredNestedObjectAsync(
    new TypesObjectWithRequiredNestedObject
    {
        RequiredString = "requiredString",
        RequiredObject = new TypesNestedObjectWithRequiredField
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

**request:** `TypesObjectWithRequiredNestedObject` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsObject.<a href="/src/SeedApi/EndpointsObject/EndpointsObjectClient.cs">EndpointsObjectGetAndReturnWithDatetimeLikeStringAsync</a>(TypesObjectWithDatetimeLikeString { ... }) -> WithRawResponseTask&lt;TypesObjectWithDatetimeLikeString&gt;</code></summary>
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
await client.EndpointsObject.EndpointsObjectGetAndReturnWithDatetimeLikeStringAsync(
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

## EndpointsPagination
<details><summary><code>client.EndpointsPagination.<a href="/src/SeedApi/EndpointsPagination/EndpointsPaginationClient.cs">EndpointsPaginationListItemsAsync</a>(EndpointsPaginationListItemsRequest { ... }) -> WithRawResponseTask&lt;EndpointsPaginatedResponse&gt;</code></summary>
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
await client.EndpointsPagination.EndpointsPaginationListItemsAsync(
    new EndpointsPaginationListItemsRequest()
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

**request:** `EndpointsPaginationListItemsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsParams
<details><summary><code>client.EndpointsParams.<a href="/src/SeedApi/EndpointsParams/EndpointsParamsClient.cs">EndpointsParamsGetWithPathAsync</a>(EndpointsParamsGetWithPathRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
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
await client.EndpointsParams.EndpointsParamsGetWithPathAsync(
    new EndpointsParamsGetWithPathRequest { Param = "param" }
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

**request:** `EndpointsParamsGetWithPathRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.<a href="/src/SeedApi/EndpointsParams/EndpointsParamsClient.cs">EndpointsParamsModifyWithPathAsync</a>(EndpointsParamsModifyWithPathRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
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
await client.EndpointsParams.EndpointsParamsModifyWithPathAsync(
    new EndpointsParamsModifyWithPathRequest { Param = "param", Body = "string" }
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

**request:** `EndpointsParamsModifyWithPathRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.<a href="/src/SeedApi/EndpointsParams/EndpointsParamsClient.cs">EndpointsParamsGetWithInlinePathAsync</a>(EndpointsParamsGetWithInlinePathRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
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
await client.EndpointsParams.EndpointsParamsGetWithInlinePathAsync(
    new EndpointsParamsGetWithInlinePathRequest { Param = "param" }
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

**request:** `EndpointsParamsGetWithInlinePathRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.<a href="/src/SeedApi/EndpointsParams/EndpointsParamsClient.cs">EndpointsParamsModifyWithInlinePathAsync</a>(EndpointsParamsModifyWithInlinePathRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
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
await client.EndpointsParams.EndpointsParamsModifyWithInlinePathAsync(
    new EndpointsParamsModifyWithInlinePathRequest { Param = "param", Body = "string" }
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

**request:** `EndpointsParamsModifyWithInlinePathRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.<a href="/src/SeedApi/EndpointsParams/EndpointsParamsClient.cs">EndpointsParamsGetWithQueryAsync</a>(EndpointsParamsGetWithQueryRequest { ... })</code></summary>
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
await client.EndpointsParams.EndpointsParamsGetWithQueryAsync(
    new EndpointsParamsGetWithQueryRequest { Query = "query", Number = 1 }
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

**request:** `EndpointsParamsGetWithQueryRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.<a href="/src/SeedApi/EndpointsParams/EndpointsParamsClient.cs">EndpointsParamsGetWithAllowMultipleQueryAsync</a>(EndpointsParamsGetWithAllowMultipleQueryRequest { ... })</code></summary>
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
await client.EndpointsParams.EndpointsParamsGetWithAllowMultipleQueryAsync(
    new EndpointsParamsGetWithAllowMultipleQueryRequest { Query = ["query"], Number = [1] }
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

**request:** `EndpointsParamsGetWithAllowMultipleQueryRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.<a href="/src/SeedApi/EndpointsParams/EndpointsParamsClient.cs">EndpointsParamsGetWithPathAndQueryAsync</a>(EndpointsParamsGetWithPathAndQueryRequest { ... })</code></summary>
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
await client.EndpointsParams.EndpointsParamsGetWithPathAndQueryAsync(
    new EndpointsParamsGetWithPathAndQueryRequest { Param = "param", Query = "query" }
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

**request:** `EndpointsParamsGetWithPathAndQueryRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.<a href="/src/SeedApi/EndpointsParams/EndpointsParamsClient.cs">EndpointsParamsGetWithInlinePathAndQueryAsync</a>(EndpointsParamsGetWithInlinePathAndQueryRequest { ... })</code></summary>
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
await client.EndpointsParams.EndpointsParamsGetWithInlinePathAndQueryAsync(
    new EndpointsParamsGetWithInlinePathAndQueryRequest { Param = "param", Query = "query" }
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

**request:** `EndpointsParamsGetWithInlinePathAndQueryRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.<a href="/src/SeedApi/EndpointsParams/EndpointsParamsClient.cs">EndpointsParamsGetWithBooleanPathAsync</a>(EndpointsParamsGetWithBooleanPathRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with boolean path param
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
await client.EndpointsParams.EndpointsParamsGetWithBooleanPathAsync(
    new EndpointsParamsGetWithBooleanPathRequest { Param = true }
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

**request:** `EndpointsParamsGetWithBooleanPathRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsParams.<a href="/src/SeedApi/EndpointsParams/EndpointsParamsClient.cs">EndpointsParamsGetWithPathAndErrorsAsync</a>(EndpointsParamsGetWithPathAndErrorsRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param that can throw errors
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
await client.EndpointsParams.EndpointsParamsGetWithPathAndErrorsAsync(
    new EndpointsParamsGetWithPathAndErrorsRequest { Param = "param" }
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

**request:** `EndpointsParamsGetWithPathAndErrorsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsPrimitive
<details><summary><code>client.EndpointsPrimitive.<a href="/src/SeedApi/EndpointsPrimitive/EndpointsPrimitiveClient.cs">EndpointsPrimitiveGetAndReturnStringAsync</a>(string { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnStringAsync("string");
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

<details><summary><code>client.EndpointsPrimitive.<a href="/src/SeedApi/EndpointsPrimitive/EndpointsPrimitiveClient.cs">EndpointsPrimitiveGetAndReturnIntAsync</a>(int { ... }) -> WithRawResponseTask&lt;int&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnIntAsync(1);
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

<details><summary><code>client.EndpointsPrimitive.<a href="/src/SeedApi/EndpointsPrimitive/EndpointsPrimitiveClient.cs">EndpointsPrimitiveGetAndReturnLongAsync</a>(long { ... }) -> WithRawResponseTask&lt;long&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnLongAsync(1000000);
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

<details><summary><code>client.EndpointsPrimitive.<a href="/src/SeedApi/EndpointsPrimitive/EndpointsPrimitiveClient.cs">EndpointsPrimitiveGetAndReturnDoubleAsync</a>(double { ... }) -> WithRawResponseTask&lt;double&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDoubleAsync(1.1);
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

<details><summary><code>client.EndpointsPrimitive.<a href="/src/SeedApi/EndpointsPrimitive/EndpointsPrimitiveClient.cs">EndpointsPrimitiveGetAndReturnBoolAsync</a>(bool { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnBoolAsync(true);
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

<details><summary><code>client.EndpointsPrimitive.<a href="/src/SeedApi/EndpointsPrimitive/EndpointsPrimitiveClient.cs">EndpointsPrimitiveGetAndReturnDatetimeAsync</a>(DateTime { ... }) -> WithRawResponseTask&lt;DateTime&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDatetimeAsync(
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

<details><summary><code>client.EndpointsPrimitive.<a href="/src/SeedApi/EndpointsPrimitive/EndpointsPrimitiveClient.cs">EndpointsPrimitiveGetAndReturnDateAsync</a>(DateOnly { ... }) -> WithRawResponseTask&lt;DateOnly&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnDateAsync(new DateOnly(2023, 1, 15));
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

<details><summary><code>client.EndpointsPrimitive.<a href="/src/SeedApi/EndpointsPrimitive/EndpointsPrimitiveClient.cs">EndpointsPrimitiveGetAndReturnUuidAsync</a>(string { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnUuidAsync("string");
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

<details><summary><code>client.EndpointsPrimitive.<a href="/src/SeedApi/EndpointsPrimitive/EndpointsPrimitiveClient.cs">EndpointsPrimitiveGetAndReturnBase64Async</a>(string { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsPrimitive.EndpointsPrimitiveGetAndReturnBase64Async("string");
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

## EndpointsPut
<details><summary><code>client.EndpointsPut.<a href="/src/SeedApi/EndpointsPut/EndpointsPutClient.cs">EndpointsPutAddAsync</a>(EndpointsPutAddRequest { ... }) -> WithRawResponseTask&lt;EndpointsPutResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsPut.EndpointsPutAddAsync(new EndpointsPutAddRequest { Id = "id" });
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

**request:** `EndpointsPutAddRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## EndpointsUnion
<details><summary><code>client.EndpointsUnion.<a href="/src/SeedApi/EndpointsUnion/EndpointsUnionClient.cs">EndpointsUnionGetAndReturnUnionAsync</a>(OneOf&lt;TypesAnimalZero, TypesAnimalOne&gt; { ... }) -> WithRawResponseTask&lt;OneOf&lt;TypesAnimalZero, TypesAnimalOne&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsUnion.EndpointsUnionGetAndReturnUnionAsync(
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

## EndpointsUrLs
<details><summary><code>client.EndpointsUrLs.<a href="/src/SeedApi/EndpointsUrLs/EndpointsUrLsClient.cs">EndpointsUrlsWithMixedCaseAsync</a>() -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsUrLs.EndpointsUrlsWithMixedCaseAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsUrLs.<a href="/src/SeedApi/EndpointsUrLs/EndpointsUrLsClient.cs">EndpointsUrlsNoEndingSlashAsync</a>() -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsUrLs.EndpointsUrlsNoEndingSlashAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsUrLs.<a href="/src/SeedApi/EndpointsUrLs/EndpointsUrLsClient.cs">EndpointsUrlsWithEndingSlashAsync</a>() -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsUrLs.EndpointsUrlsWithEndingSlashAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.EndpointsUrLs.<a href="/src/SeedApi/EndpointsUrLs/EndpointsUrLsClient.cs">EndpointsUrlsWithUnderscoresAsync</a>() -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.EndpointsUrLs.EndpointsUrlsWithUnderscoresAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlinedrequests
<details><summary><code>client.Inlinedrequests.<a href="/src/SeedApi/Inlinedrequests/InlinedrequestsClient.cs">PostwithobjectbodyandresponseAsync</a>(InlinedRequestsPostWithObjectBodyandResponseRequest { ... }) -> WithRawResponseTask&lt;TypesObjectWithOptionalField&gt;</code></summary>
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
await client.Inlinedrequests.PostwithobjectbodyandresponseAsync(
    new InlinedRequestsPostWithObjectBodyandResponseRequest
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

**request:** `InlinedRequestsPostWithObjectBodyandResponseRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Noauth
<details><summary><code>client.Noauth.<a href="/src/SeedApi/Noauth/NoauthClient.cs">PostwithnoauthAsync</a>(object { ... }) -> WithRawResponseTask&lt;bool&gt;</code></summary>
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
await client.Noauth.PostwithnoauthAsync(new Dictionary<object, object?>() { { "key", "value" } });
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

## Noreqbody
<details><summary><code>client.Noreqbody.<a href="/src/SeedApi/Noreqbody/NoreqbodyClient.cs">GetwithnorequestbodyAsync</a>() -> WithRawResponseTask&lt;TypesObjectWithOptionalField&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Noreqbody.GetwithnorequestbodyAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Noreqbody.<a href="/src/SeedApi/Noreqbody/NoreqbodyClient.cs">PostwithnorequestbodyAsync</a>() -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Noreqbody.PostwithnorequestbodyAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reqwithheaders
<details><summary><code>client.Reqwithheaders.<a href="/src/SeedApi/Reqwithheaders/ReqwithheadersClient.cs">GetwithcustomheaderAsync</a>(ReqWithHeadersGetWithCustomHeaderRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Reqwithheaders.GetwithcustomheaderAsync(
    new ReqWithHeadersGetWithCustomHeaderRequest
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

**request:** `ReqWithHeadersGetWithCustomHeaderRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

