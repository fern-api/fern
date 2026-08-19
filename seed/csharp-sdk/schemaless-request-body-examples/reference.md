# Reference
<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">CreatePlantAsync</a>(object { ... }) -> WithRawResponseTask&lt;CreatePlantResponse&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a plant with example JSON but no request body schema.
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
await client.CreatePlantAsync(
    new Dictionary<object, object?>()
    {
        {
            "care",
            new Dictionary<object, object?>()
            {
                { "humidity", "high" },
                { "light", "full sun" },
                { "water", "distilled only" },
            }
        },
        { "name", "Venus Flytrap" },
        { "species", "Dionaea muscipula" },
        {
            "tags",
            new List<object?>() { "carnivorous", "tropical" }
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

**request:** `object` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">UpdatePlantAsync</a>(UpdatePlantRequest { ... }) -> WithRawResponseTask&lt;UpdatePlantResponse&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a plant with example JSON but no request body schema.
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
await client.UpdatePlantAsync(
    new UpdatePlantRequest
    {
        PlantId = "plantId",
        Body = new Dictionary<object, object?>()
        {
            {
                "care",
                new Dictionary<object, object?>() { { "light", "partial shade" } }
            },
            { "name", "Updated Venus Flytrap" },
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

**request:** `UpdatePlantRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">CreatePlantWithSchemaAsync</a>(CreatePlantWithSchemaRequest { ... }) -> WithRawResponseTask&lt;CreatePlantWithSchemaResponse&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

A control endpoint that has both schema and example defined.
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
await client.CreatePlantWithSchemaAsync(
    new CreatePlantWithSchemaRequest { Name = "Sundew", Species = "Drosera capensis" }
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

**request:** `CreatePlantWithSchemaRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

