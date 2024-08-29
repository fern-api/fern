# Reference
## Endpoints Container
<details><summary><code>client.Endpoints.Container.<a href="Endpoints/Container">GetAndReturnListOfPrimitivesAsync</a>(IEnumerable<string> { ... }) -> IEnumerable<string></code></summary>
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

<details><summary><code>client.Endpoints.Container.<a href="Endpoints/Container">GetAndReturnListOfObjectsAsync</a>(using SeedExhaustive.Types.Object;

    #nullable enable
    
    IEnumerable<ObjectWithRequiredField> { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    IEnumerable<ObjectWithRequiredField></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnListOfObjectsAsync(
    new List<ObjectWithRequiredField>() { new ObjectWithRequiredField { String = "string" } }
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

**request:** `using SeedExhaustive.Types.Object;

    #nullable enable
    
    IEnumerable<ObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="Endpoints/Container">GetAndReturnSetOfPrimitivesAsync</a>(HashSet<string> { ... }) -> HashSet<string></code></summary>
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

<details><summary><code>client.Endpoints.Container.<a href="Endpoints/Container">GetAndReturnSetOfObjectsAsync</a>(using SeedExhaustive.Types.Object;

    #nullable enable
    
    HashSet<ObjectWithRequiredField> { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    HashSet<ObjectWithRequiredField></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnSetOfObjectsAsync(
    new HashSet<ObjectWithRequiredField>() { new ObjectWithRequiredField { String = "string" } }
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

**request:** `using SeedExhaustive.Types.Object;

    #nullable enable
    
    HashSet<ObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="Endpoints/Container">GetAndReturnMapPrimToPrimAsync</a>(Dictionary<string, string> { ... }) -> Dictionary<string, string></code></summary>
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

<details><summary><code>client.Endpoints.Container.<a href="Endpoints/Container">GetAndReturnMapOfPrimToObjectAsync</a>(using SeedExhaustive.Types.Object;

    #nullable enable
    
    Dictionary<string, ObjectWithRequiredField> { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    Dictionary<string, ObjectWithRequiredField></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnMapOfPrimToObjectAsync(
    new Dictionary<string, ObjectWithRequiredField>()
    {
        {
            "string",
            new ObjectWithRequiredField { String = "string" }
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

**request:** `using SeedExhaustive.Types.Object;

    #nullable enable
    
    Dictionary<string, ObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Container.<a href="Endpoints/Container">GetAndReturnOptionalAsync</a>(using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithRequiredField? { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithRequiredField?</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Container.GetAndReturnOptionalAsync(
    new ObjectWithRequiredField { String = "string" }
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

**request:** `using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithRequiredField?` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Enum
<details><summary><code>client.Endpoints.Enum.<a href="Endpoints/Enum">GetAndReturnEnumAsync</a>(using SeedExhaustive.Types.Enum;

    #nullable enable
    
    WeatherReport { ... }) -> using SeedExhaustive.Types.Enum;

    #nullable enable
    
    WeatherReport</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Enum.GetAndReturnEnumAsync(WeatherReport.Sunny);

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `using SeedExhaustive.Types.Enum;

    #nullable enable
    
    WeatherReport` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints HttpMethods
<details><summary><code>client.Endpoints.HttpMethods.<a href="Endpoints/HttpMethods">TestGetAsync</a>(id) -> string</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestGetAsync("string");

```
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

<details><summary><code>client.Endpoints.HttpMethods.<a href="Endpoints/HttpMethods">TestPostAsync</a>(using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithRequiredField { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestPostAsync(new ObjectWithRequiredField { String = "string" });

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HttpMethods.<a href="Endpoints/HttpMethods">TestPutAsync</a>(id, using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithRequiredField { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestPutAsync(
    "string",
    new ObjectWithRequiredField { String = "string" }
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

**request:** `using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HttpMethods.<a href="Endpoints/HttpMethods">TestPatchAsync</a>(id, using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithOptionalField { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestPatchAsync(
    "string",
    new ObjectWithOptionalField
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
        List = new List<string>() { "string" },
        Set = new HashSet<string>() { "string" },
        Map = new Dictionary<int, string>() { { 1, "string" } },
        Bigint = "123456789123456789",
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

**request:** `using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.HttpMethods.<a href="Endpoints/HttpMethods">TestDeleteAsync</a>(id) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.HttpMethods.TestDeleteAsync("string");

```
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
<details><summary><code>client.Endpoints.Object.<a href="Endpoints/Object">GetAndReturnWithOptionalFieldAsync</a>(using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithOptionalField { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnWithOptionalFieldAsync(
    new ObjectWithOptionalField
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
        List = new List<string>() { "string" },
        Set = new HashSet<string>() { "string" },
        Map = new Dictionary<int, string>() { { 1, "string" } },
        Bigint = "123456789123456789",
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

**request:** `using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="Endpoints/Object">GetAndReturnWithRequiredFieldAsync</a>(using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithRequiredField { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnWithRequiredFieldAsync(
    new ObjectWithRequiredField { String = "string" }
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

**request:** `using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="Endpoints/Object">GetAndReturnWithMapOfMapAsync</a>(using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithMapOfMap { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithMapOfMap</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnWithMapOfMapAsync(
    new ObjectWithMapOfMap
    {
        Map = new Dictionary<string, Dictionary<string, string>>()
        {
            {
                "string",
                new Dictionary<string, string>() { { "string", "string" } }
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

**request:** `using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithMapOfMap` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="Endpoints/Object">GetAndReturnNestedWithOptionalFieldAsync</a>(using SeedExhaustive.Types.Object;

    #nullable enable
    
    NestedObjectWithOptionalField { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    NestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnNestedWithOptionalFieldAsync(
    new NestedObjectWithOptionalField
    {
        String = "string",
        NestedObject = new ObjectWithOptionalField
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
            List = new List<string>() { "string" },
            Set = new HashSet<string>() { "string" },
            Map = new Dictionary<int, string>() { { 1, "string" } },
            Bigint = "123456789123456789",
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

**request:** `using SeedExhaustive.Types.Object;

    #nullable enable
    
    NestedObjectWithOptionalField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="Endpoints/Object">GetAndReturnNestedWithRequiredFieldAsync</a>(string_, using SeedExhaustive.Types.Object;

    #nullable enable
    
    NestedObjectWithRequiredField { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    NestedObjectWithRequiredField</code></summary>
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
    new NestedObjectWithRequiredField
    {
        String = "string",
        NestedObject = new ObjectWithOptionalField
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
            List = new List<string>() { "string" },
            Set = new HashSet<string>() { "string" },
            Map = new Dictionary<int, string>() { { 1, "string" } },
            Bigint = "123456789123456789",
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

**request:** `using SeedExhaustive.Types.Object;

    #nullable enable
    
    NestedObjectWithRequiredField` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Object.<a href="Endpoints/Object">GetAndReturnNestedWithRequiredFieldAsListAsync</a>(using SeedExhaustive.Types.Object;

    #nullable enable
    
    IEnumerable<NestedObjectWithRequiredField> { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsListAsync(
    new List<NestedObjectWithRequiredField>()
    {
        new NestedObjectWithRequiredField
        {
            String = "string",
            NestedObject = new ObjectWithOptionalField
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
                List = new List<string>() { "string" },
                Set = new HashSet<string>() { "string" },
                Map = new Dictionary<int, string>() { { 1, "string" } },
                Bigint = "123456789123456789",
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

**request:** `using SeedExhaustive.Types.Object;

    #nullable enable
    
    IEnumerable<NestedObjectWithRequiredField>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Params
<details><summary><code>client.Endpoints.Params.<a href="Endpoints/Params">GetWithPathAsync</a>(param) -> string</code></summary>
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
await client.Endpoints.Params.GetWithPathAsync("string");

```
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

<details><summary><code>client.Endpoints.Params.<a href="Endpoints/Params">GetWithQueryAsync</a>(using SeedExhaustive.Endpoints.Params;

    #nullable enable
    
    GetWithQuery { ... })</code></summary>
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
await client.Endpoints.Params.GetWithQueryAsync(new GetWithQuery { Query = "string", Number = 1 });

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `using SeedExhaustive.Endpoints.Params;

    #nullable enable
    
    GetWithQuery` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="Endpoints/Params">GetWithAllowMultipleQueryAsync</a>(using SeedExhaustive.Endpoints.Params;

    #nullable enable
    
    GetWithMultipleQuery { ... })</code></summary>
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
    new GetWithMultipleQuery { Query = ["string"], Numer = [1] }
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

**request:** `using SeedExhaustive.Endpoints.Params;

    #nullable enable
    
    GetWithMultipleQuery` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="Endpoints/Params">GetWithPathAndQueryAsync</a>(param, using SeedExhaustive.Endpoints.Params;

    #nullable enable
    
    GetWithPathAndQuery { ... })</code></summary>
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
    "string",
    new GetWithPathAndQuery { Query = "string" }
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

**request:** `using SeedExhaustive.Endpoints.Params;

    #nullable enable
    
    GetWithPathAndQuery` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Endpoints.Params.<a href="Endpoints/Params">ModifyWithPathAsync</a>(param, string { ... }) -> string</code></summary>
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
await client.Endpoints.Params.ModifyWithPathAsync("string", "string");

```
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

## Endpoints Primitive
<details><summary><code>client.Endpoints.Primitive.<a href="Endpoints/Primitive">GetAndReturnStringAsync</a>(string { ... }) -> string</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="Endpoints/Primitive">GetAndReturnIntAsync</a>(int { ... }) -> int</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="Endpoints/Primitive">GetAndReturnLongAsync</a>(long { ... }) -> long</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="Endpoints/Primitive">GetAndReturnDoubleAsync</a>(double { ... }) -> double</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="Endpoints/Primitive">GetAndReturnBoolAsync</a>(bool { ... }) -> bool</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="Endpoints/Primitive">GetAndReturnDatetimeAsync</a>(DateTime { ... }) -> DateTime</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="Endpoints/Primitive">GetAndReturnDateAsync</a>(DateOnly { ... }) -> DateOnly</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="Endpoints/Primitive">GetAndReturnUuidAsync</a>(string { ... }) -> string</code></summary>
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

<details><summary><code>client.Endpoints.Primitive.<a href="Endpoints/Primitive">GetAndReturnBase64Async</a>(string { ... }) -> string</code></summary>
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

## Endpoints Union
<details><summary><code>client.Endpoints.Union.<a href="Endpoints/Union">GetAndReturnUnionAsync</a>(object { ... }) -> object</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Endpoints.Union.GetAndReturnUnionAsync(
    new Dog { Name = "string", LikesToWoof = true }
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

**request:** `object` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlinedRequests
<details><summary><code>client.InlinedRequests.<a href="InlinedRequests">PostWithObjectBodyandResponseAsync</a>(using SeedExhaustive.InlinedRequests;

    #nullable enable
    
    PostWithObjectBody { ... }) -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithOptionalField</code></summary>
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
    new PostWithObjectBody
    {
        String = "string",
        Integer = 1,
        NestedObject = new ObjectWithOptionalField
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
            List = new List<string>() { "string" },
            Set = new HashSet<string>() { "string" },
            Map = new Dictionary<int, string>() { { 1, "string" } },
            Bigint = "123456789123456789",
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

**request:** `using SeedExhaustive.InlinedRequests;

    #nullable enable
    
    PostWithObjectBody` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoAuth
<details><summary><code>client.NoAuth.<a href="NoAuth">PostWithNoAuthAsync</a>(object { ... }) -> bool</code></summary>
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
<details><summary><code>client.NoReqBody.<a href="NoReqBody">GetWithNoRequestBodyAsync</a>() -> using SeedExhaustive.Types.Object;

    #nullable enable
    
    ObjectWithOptionalField</code></summary>
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

<details><summary><code>client.NoReqBody.<a href="NoReqBody">PostWithNoRequestBodyAsync</a>() -> string</code></summary>
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
<details><summary><code>client.ReqWithHeaders.<a href="ReqWithHeaders">GetWithCustomHeaderAsync</a>(ReqWithHeaders.ReqWithHeaders { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.ReqWithHeaders.GetWithCustomHeaderAsync(
    new SeedExhaustive.ReqWithHeaders.ReqWithHeaders
    {
        XTestEndpointHeader = "string",
        XTestServiceHeader = "string",
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

**request:** `ReqWithHeaders.ReqWithHeaders` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
