# Reference
## Endpoints Container
<details><summary><code>client.Endpoints.Container.<a href="/src/SeedExhaustive/Endpoints/Container/ContainerClient.cs">GetAndReturnListOfPrimitivesAsync</a>(IEnumerable<string> { ... }) -> IEnumerable<string></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnListOfPrimitivesAsync(
    new List<string>() { "string", "string" }
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

<details><summary><code>client.Endpoints.Container.<a href="/src/SeedExhaustive/Endpoints/Container/ContainerClient.cs">GetAndReturnListOfObjectsAsync</a>(IEnumerable<SeedExhaustive.Types.ObjectWithRequiredField> { ... }) -> IEnumerable<SeedExhaustive.Types.ObjectWithRequiredField></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnListOfObjectsAsync(
    new List<SeedExhaustive.Types.ObjectWithRequiredField>()
    {
        new SeedExhaustive.Types.ObjectWithRequiredField { String = "string" },
        new SeedExhaustive.Types.ObjectWithRequiredField { String = "string" },
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

**request:** `IEnumerable<SeedExhaustive.Types.ObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="/src/SeedExhaustive/Endpoints/Container/ContainerClient.cs">GetAndReturnSetOfPrimitivesAsync</a>(HashSet<string> { ... }) -> HashSet<string></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnSetOfPrimitivesAsync(
    new HashSet<string>() { "string" }
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

**request:** `HashSet<string>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="/src/SeedExhaustive/Endpoints/Container/ContainerClient.cs">GetAndReturnSetOfObjectsAsync</a>(HashSet<SeedExhaustive.Types.ObjectWithRequiredField> { ... }) -> HashSet<SeedExhaustive.Types.ObjectWithRequiredField></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnSetOfObjectsAsync(
    new HashSet<SeedExhaustive.Types.ObjectWithRequiredField>()
    {
        new SeedExhaustive.Types.ObjectWithRequiredField { String = "string" },
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

**request:** `HashSet<SeedExhaustive.Types.ObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="/src/SeedExhaustive/Endpoints/Container/ContainerClient.cs">GetAndReturnMapPrimToPrimAsync</a>(Dictionary<string, string> { ... }) -> Dictionary<string, string></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnMapPrimToPrimAsync(
    new Dictionary<string, string>() { { "string", "string" } }
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

<details><summary><code>client.Endpoints.Container.<a href="/src/SeedExhaustive/Endpoints/Container/ContainerClient.cs">GetAndReturnMapOfPrimToObjectAsync</a>(Dictionary<string, SeedExhaustive.Types.ObjectWithRequiredField> { ... }) -> Dictionary<string, SeedExhaustive.Types.ObjectWithRequiredField></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnMapOfPrimToObjectAsync(
    new Dictionary<string, SeedExhaustive.Types.ObjectWithRequiredField>()
    {
        {
            "string",
            new SeedExhaustive.Types.ObjectWithRequiredField { String = "string" }
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

**request:** `Dictionary<string, SeedExhaustive.Types.ObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="/src/SeedExhaustive/Endpoints/Container/ContainerClient.cs">GetAndReturnOptionalAsync</a>(SeedExhaustive.Types.ObjectWithRequiredField? { ... }) -> SeedExhaustive.Types.ObjectWithRequiredField?</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnOptionalAsync(
    new SeedExhaustive.Types.ObjectWithRequiredField { String = "string" }
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

**request:** `SeedExhaustive.Types.ObjectWithRequiredField?` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints ContentType
<details><summary><code>client.Endpoints.ContentType.<a href="/src/SeedExhaustive/Endpoints/ContentType/ContentTypeClient.cs">PostJsonPatchContentTypeAsync</a>(SeedExhaustive.Types.ObjectWithOptionalField { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.ContentType.PostJsonPatchContentTypeAsync(
    new SeedExhaustive.Types.ObjectWithOptionalField
    {
        String = "string",
        Integer = 1,
        Long = 1000000,
        Double = 1.1,
        Bool = true,
        Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        Date = new DateOnly(2023, 1, 15),
        Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        Base64 = "SGVsbG8gd29ybGQh",
        List = new List<string>() { "list", "list" },
        Set = new HashSet<string>() { "set" },
        Map = new Dictionary<int, string>() { { 1, "map" } },
        Bigint = "1000000",
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

**request:** `SeedExhaustive.Types.ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.ContentType.<a href="/src/SeedExhaustive/Endpoints/ContentType/ContentTypeClient.cs">PostJsonPatchContentWithCharsetTypeAsync</a>(SeedExhaustive.Types.ObjectWithOptionalField { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.ContentType.PostJsonPatchContentWithCharsetTypeAsync(
    new SeedExhaustive.Types.ObjectWithOptionalField
    {
        String = "string",
        Integer = 1,
        Long = 1000000,
        Double = 1.1,
        Bool = true,
        Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        Date = new DateOnly(2023, 1, 15),
        Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        Base64 = "SGVsbG8gd29ybGQh",
        List = new List<string>() { "list", "list" },
        Set = new HashSet<string>() { "set" },
        Map = new Dictionary<int, string>() { { 1, "map" } },
        Bigint = "1000000",
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

**request:** `SeedExhaustive.Types.ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Enum
<details><summary><code>client.Endpoints.Enum.<a href="/src/SeedExhaustive/Endpoints/Enum/EnumClient.cs">GetAndReturnEnumAsync</a>(SeedExhaustive.Types.WeatherReport { ... }) -> SeedExhaustive.Types.WeatherReport</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Enum.GetAndReturnEnumAsync(SeedExhaustive.Types.WeatherReport.Sunny);
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

**request:** `SeedExhaustive.Types.WeatherReport` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints HttpMethods
<details><summary><code>client.Endpoints.HttpMethods.<a href="/src/SeedExhaustive/Endpoints/HttpMethods/HttpMethodsClient.cs">TestGetAsync</a>(id) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestGetAsync("id");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HttpMethods.<a href="/src/SeedExhaustive/Endpoints/HttpMethods/HttpMethodsClient.cs">TestPostAsync</a>(SeedExhaustive.Types.ObjectWithRequiredField { ... }) -> SeedExhaustive.Types.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestPostAsync(
    new SeedExhaustive.Types.ObjectWithRequiredField { String = "string" }
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

**request:** `SeedExhaustive.Types.ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HttpMethods.<a href="/src/SeedExhaustive/Endpoints/HttpMethods/HttpMethodsClient.cs">TestPutAsync</a>(id, SeedExhaustive.Types.ObjectWithRequiredField { ... }) -> SeedExhaustive.Types.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestPutAsync(
    "id",
    new SeedExhaustive.Types.ObjectWithRequiredField { String = "string" }
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedExhaustive.Types.ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HttpMethods.<a href="/src/SeedExhaustive/Endpoints/HttpMethods/HttpMethodsClient.cs">TestPatchAsync</a>(id, SeedExhaustive.Types.ObjectWithOptionalField { ... }) -> SeedExhaustive.Types.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestPatchAsync(
    "id",
    new SeedExhaustive.Types.ObjectWithOptionalField
    {
        String = "string",
        Integer = 1,
        Long = 1000000,
        Double = 1.1,
        Bool = true,
        Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        Date = new DateOnly(2023, 1, 15),
        Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        Base64 = "SGVsbG8gd29ybGQh",
        List = new List<string>() { "list", "list" },
        Set = new HashSet<string>() { "set" },
        Map = new Dictionary<int, string>() { { 1, "map" } },
        Bigint = "1000000",
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

**id:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedExhaustive.Types.ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HttpMethods.<a href="/src/SeedExhaustive/Endpoints/HttpMethods/HttpMethodsClient.cs">TestDeleteAsync</a>(id) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestDeleteAsync("id");
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
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Object
<details><summary><code>client.Endpoints.Object.<a href="/src/SeedExhaustive/Endpoints/Object/ObjectClient.cs">GetAndReturnWithOptionalFieldAsync</a>(SeedExhaustive.Types.ObjectWithOptionalField { ... }) -> SeedExhaustive.Types.ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnWithOptionalFieldAsync(
    new SeedExhaustive.Types.ObjectWithOptionalField
    {
        String = "string",
        Integer = 1,
        Long = 1000000,
        Double = 1.1,
        Bool = true,
        Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        Date = new DateOnly(2023, 1, 15),
        Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        Base64 = "SGVsbG8gd29ybGQh",
        List = new List<string>() { "list", "list" },
        Set = new HashSet<string>() { "set" },
        Map = new Dictionary<int, string>() { { 1, "map" } },
        Bigint = "1000000",
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

**request:** `SeedExhaustive.Types.ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedExhaustive/Endpoints/Object/ObjectClient.cs">GetAndReturnWithRequiredFieldAsync</a>(SeedExhaustive.Types.ObjectWithRequiredField { ... }) -> SeedExhaustive.Types.ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnWithRequiredFieldAsync(
    new SeedExhaustive.Types.ObjectWithRequiredField { String = "string" }
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

**request:** `SeedExhaustive.Types.ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedExhaustive/Endpoints/Object/ObjectClient.cs">GetAndReturnWithMapOfMapAsync</a>(SeedExhaustive.Types.ObjectWithMapOfMap { ... }) -> SeedExhaustive.Types.ObjectWithMapOfMap</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnWithMapOfMapAsync(
    new SeedExhaustive.Types.ObjectWithMapOfMap
    {
        Map = new Dictionary<string, Dictionary<string, string>>()
        {
            {
                "map",
                new Dictionary<string, string>() { { "map", "map" } }
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

**request:** `SeedExhaustive.Types.ObjectWithMapOfMap` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedExhaustive/Endpoints/Object/ObjectClient.cs">GetAndReturnNestedWithOptionalFieldAsync</a>(SeedExhaustive.Types.NestedObjectWithOptionalField { ... }) -> SeedExhaustive.Types.NestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnNestedWithOptionalFieldAsync(
    new SeedExhaustive.Types.NestedObjectWithOptionalField
    {
        String = "string",
        NestedObject = new SeedExhaustive.Types.ObjectWithOptionalField
        {
            String = "string",
            Integer = 1,
            Long = 1000000,
            Double = 1.1,
            Bool = true,
            Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
            Date = new DateOnly(2023, 1, 15),
            Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            Base64 = "SGVsbG8gd29ybGQh",
            List = new List<string>() { "list", "list" },
            Set = new HashSet<string>() { "set" },
            Map = new Dictionary<int, string>() { { 1, "map" } },
            Bigint = "1000000",
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

**request:** `SeedExhaustive.Types.NestedObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedExhaustive/Endpoints/Object/ObjectClient.cs">GetAndReturnNestedWithRequiredFieldAsync</a>(string_, SeedExhaustive.Types.NestedObjectWithRequiredField { ... }) -> SeedExhaustive.Types.NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsync(
    "string",
    new SeedExhaustive.Types.NestedObjectWithRequiredField
    {
        String = "string",
        NestedObject = new SeedExhaustive.Types.ObjectWithOptionalField
        {
            String = "string",
            Integer = 1,
            Long = 1000000,
            Double = 1.1,
            Bool = true,
            Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
            Date = new DateOnly(2023, 1, 15),
            Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            Base64 = "SGVsbG8gd29ybGQh",
            List = new List<string>() { "list", "list" },
            Set = new HashSet<string>() { "set" },
            Map = new Dictionary<int, string>() { { 1, "map" } },
            Bigint = "1000000",
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

**string_:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedExhaustive.Types.NestedObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="/src/SeedExhaustive/Endpoints/Object/ObjectClient.cs">GetAndReturnNestedWithRequiredFieldAsListAsync</a>(IEnumerable<SeedExhaustive.Types.NestedObjectWithRequiredField> { ... }) -> SeedExhaustive.Types.NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsListAsync(
    new List<SeedExhaustive.Types.NestedObjectWithRequiredField>()
    {
        new SeedExhaustive.Types.NestedObjectWithRequiredField
        {
            String = "string",
            NestedObject = new SeedExhaustive.Types.ObjectWithOptionalField
            {
                String = "string",
                Integer = 1,
                Long = 1000000,
                Double = 1.1,
                Bool = true,
                Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
                Date = new DateOnly(2023, 1, 15),
                Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                Base64 = "SGVsbG8gd29ybGQh",
                List = new List<string>() { "list", "list" },
                Set = new HashSet<string>() { "set" },
                Map = new Dictionary<int, string>() { { 1, "map" } },
                Bigint = "1000000",
            },
        },
        new SeedExhaustive.Types.NestedObjectWithRequiredField
        {
            String = "string",
            NestedObject = new SeedExhaustive.Types.ObjectWithOptionalField
            {
                String = "string",
                Integer = 1,
                Long = 1000000,
                Double = 1.1,
                Bool = true,
                Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
                Date = new DateOnly(2023, 1, 15),
                Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                Base64 = "SGVsbG8gd29ybGQh",
                List = new List<string>() { "list", "list" },
                Set = new HashSet<string>() { "set" },
                Map = new Dictionary<int, string>() { { 1, "map" } },
                Bigint = "1000000",
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

**request:** `IEnumerable<SeedExhaustive.Types.NestedObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Params
<details><summary><code>client.Endpoints.Params.<a href="/src/SeedExhaustive/Endpoints/Params/ParamsClient.cs">GetWithPathAsync</a>(param) -> string</code></summary>
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
await client.Endpoints.Params.GetWithPathAsync("param");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedExhaustive/Endpoints/Params/ParamsClient.cs">GetWithInlinePathAsync</a>(SeedExhaustive.Endpoints.GetWithInlinePath { ... }) -> string</code></summary>
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
    new SeedExhaustive.Endpoints.GetWithInlinePath { Param = "param" }
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

**request:** `SeedExhaustive.Endpoints.GetWithInlinePath` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedExhaustive/Endpoints/Params/ParamsClient.cs">GetWithQueryAsync</a>(SeedExhaustive.Endpoints.GetWithQuery { ... })</code></summary>
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
    new SeedExhaustive.Endpoints.GetWithQuery { Query = "query", Number = 1 }
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

**request:** `SeedExhaustive.Endpoints.GetWithQuery` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedExhaustive/Endpoints/Params/ParamsClient.cs">GetWithAllowMultipleQueryAsync</a>(SeedExhaustive.Endpoints.GetWithMultipleQuery { ... })</code></summary>
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
    new SeedExhaustive.Endpoints.GetWithMultipleQuery { Query = ["query"], Number = [1] }
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

**request:** `SeedExhaustive.Endpoints.GetWithMultipleQuery` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedExhaustive/Endpoints/Params/ParamsClient.cs">GetWithPathAndQueryAsync</a>(param, SeedExhaustive.Endpoints.GetWithPathAndQuery { ... })</code></summary>
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
    "param",
    new SeedExhaustive.Endpoints.GetWithPathAndQuery { Query = "query" }
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

**param:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `SeedExhaustive.Endpoints.GetWithPathAndQuery` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedExhaustive/Endpoints/Params/ParamsClient.cs">GetWithInlinePathAndQueryAsync</a>(SeedExhaustive.Endpoints.GetWithInlinePathAndQuery { ... })</code></summary>
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
    new SeedExhaustive.Endpoints.GetWithInlinePathAndQuery { Param = "param", Query = "query" }
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

**request:** `SeedExhaustive.Endpoints.GetWithInlinePathAndQuery` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedExhaustive/Endpoints/Params/ParamsClient.cs">ModifyWithPathAsync</a>(param, string { ... }) -> string</code></summary>
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
await client.Endpoints.Params.ModifyWithPathAsync("param", "string");
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="/src/SeedExhaustive/Endpoints/Params/ParamsClient.cs">ModifyWithInlinePathAsync</a>(SeedExhaustive.Endpoints.ModifyResourceAtInlinedPath { ... }) -> string</code></summary>
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
    new SeedExhaustive.Endpoints.ModifyResourceAtInlinedPath { Param = "param", Body = "string" }
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

**request:** `SeedExhaustive.Endpoints.ModifyResourceAtInlinedPath` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Primitive
<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedExhaustive/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnStringAsync</a>(string { ... }) -> string</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedExhaustive/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnIntAsync</a>(int { ... }) -> int</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedExhaustive/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnLongAsync</a>(long { ... }) -> long</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedExhaustive/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnDoubleAsync</a>(double { ... }) -> double</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedExhaustive/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnBoolAsync</a>(bool { ... }) -> bool</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedExhaustive/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnDatetimeAsync</a>(DateTime { ... }) -> DateTime</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedExhaustive/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnDateAsync</a>(DateOnly { ... }) -> DateOnly</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedExhaustive/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnUuidAsync</a>(string { ... }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Primitive.GetAndReturnUuidAsync("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32");
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

<details><summary><code>client.Endpoints.Primitive.<a href="/src/SeedExhaustive/Endpoints/Primitive/PrimitiveClient.cs">GetAndReturnBase64Async</a>(string { ... }) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Primitive.GetAndReturnBase64Async("SGVsbG8gd29ybGQh");
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
<details><summary><code>client.Endpoints.Put.<a href="/src/SeedExhaustive/Endpoints/Put/PutClient.cs">AddAsync</a>(SeedExhaustive.Endpoints.PutRequest { ... }) -> SeedExhaustive.Endpoints.PutResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Put.AddAsync(new SeedExhaustive.Endpoints.PutRequest { Id = "id" });
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

**request:** `SeedExhaustive.Endpoints.PutRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Union
<details><summary><code>client.Endpoints.Union.<a href="/src/SeedExhaustive/Endpoints/Union/UnionClient.cs">GetAndReturnUnionAsync</a>(SeedExhaustive.Types.Animal { ... }) -> SeedExhaustive.Types.Animal</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Union.GetAndReturnUnionAsync(
    new SeedExhaustive.Types.Animal(
        new SeedExhaustive.Types.Animal.Dog(
            new SeedExhaustive.Types.Dog { Name = "name", LikesToWoof = true }
        )
    )
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

**request:** `SeedExhaustive.Types.Animal` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Urls
<details><summary><code>client.Endpoints.Urls.<a href="/src/SeedExhaustive/Endpoints/Urls/UrlsClient.cs">WithMixedCaseAsync</a>() -> string</code></summary>
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

<details><summary><code>client.Endpoints.Urls.<a href="/src/SeedExhaustive/Endpoints/Urls/UrlsClient.cs">NoEndingSlashAsync</a>() -> string</code></summary>
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

<details><summary><code>client.Endpoints.Urls.<a href="/src/SeedExhaustive/Endpoints/Urls/UrlsClient.cs">WithEndingSlashAsync</a>() -> string</code></summary>
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

<details><summary><code>client.Endpoints.Urls.<a href="/src/SeedExhaustive/Endpoints/Urls/UrlsClient.cs">WithUnderscoresAsync</a>() -> string</code></summary>
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

## InlinedRequests
<details><summary><code>client.InlinedRequests.<a href="/src/SeedExhaustive/InlinedRequests/InlinedRequestsClient.cs">PostWithObjectBodyandResponseAsync</a>(SeedExhaustive.PostWithObjectBody { ... }) -> SeedExhaustive.Types.ObjectWithOptionalField</code></summary>
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
    new SeedExhaustive.PostWithObjectBody
    {
        String = "string",
        Integer = 1,
        NestedObject = new SeedExhaustive.Types.ObjectWithOptionalField
        {
            String = "string",
            Integer = 1,
            Long = 1000000,
            Double = 1.1,
            Bool = true,
            Datetime = new DateTime(2024, 01, 15, 09, 30, 00, 000),
            Date = new DateOnly(2023, 1, 15),
            Uuid = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            Base64 = "SGVsbG8gd29ybGQh",
            List = new List<string>() { "list", "list" },
            Set = new HashSet<string>() { "set" },
            Map = new Dictionary<int, string>() { { 1, "map" } },
            Bigint = "1000000",
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

**request:** `SeedExhaustive.PostWithObjectBody` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoAuth
<details><summary><code>client.NoAuth.<a href="/src/SeedExhaustive/NoAuth/NoAuthClient.cs">PostWithNoAuthAsync</a>(object { ... }) -> bool</code></summary>
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
<details><summary><code>client.NoReqBody.<a href="/src/SeedExhaustive/NoReqBody/NoReqBodyClient.cs">GetWithNoRequestBodyAsync</a>() -> SeedExhaustive.Types.ObjectWithOptionalField</code></summary>
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

<details><summary><code>client.NoReqBody.<a href="/src/SeedExhaustive/NoReqBody/NoReqBodyClient.cs">PostWithNoRequestBodyAsync</a>() -> string</code></summary>
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
<details><summary><code>client.ReqWithHeaders.<a href="/src/SeedExhaustive/ReqWithHeaders/ReqWithHeadersClient.cs">GetWithCustomHeaderAsync</a>(SeedExhaustive.ReqWithHeaders { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.ReqWithHeaders.GetWithCustomHeaderAsync(
    new SeedExhaustive.ReqWithHeaders
    {
        XTestEndpointHeader = "X-TEST-ENDPOINT-HEADER",
        XTestServiceHeader = "X-TEST-SERVICE-HEADER",
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

**request:** `SeedExhaustive.ReqWithHeaders` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
