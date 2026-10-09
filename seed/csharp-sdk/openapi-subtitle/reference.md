# Reference
<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">ListPlantsAsync</a>() -> WithRawResponseTask&lt;IEnumerable&lt;Plant&gt;&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a paginated list of all plants currently in the store inventory.
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
await client.ListPlantsAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">GetPlantAsync</a>(GetPlantRequest { ... }) -> WithRawResponseTask&lt;Plant&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve details about a specific plant by its unique identifier.
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
await client.GetPlantAsync(new GetPlantRequest { PlantId = "plantId" });
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `GetPlantRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

