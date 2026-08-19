# Reference
<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">SearchRuleTypesAsync</a>(SearchRuleTypesRequest { ... }) -> WithRawResponseTask&lt;RuleTypeSearchResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.SearchRuleTypesAsync(new SearchRuleTypesRequest());
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SearchRuleTypesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">CreateRuleAsync</a>(RuleCreateRequest { ... }) -> WithRawResponseTask&lt;RuleResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateRuleAsync(
    new RuleCreateRequest
    {
        Name = "name",
        ExecutionContext = RuleCreateRequestExecutionContext.Prod,
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

**request:** `RuleCreateRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">ListUsersAsync</a>() -> WithRawResponseTask&lt;UserSearchResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.ListUsersAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">GetEntityAsync</a>() -> WithRawResponseTask&lt;CombinedEntity&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.GetEntityAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">GetOrganizationAsync</a>() -> WithRawResponseTask&lt;Organization&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.GetOrganizationAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">CreatePlantAsync</a>(PlantPost { ... }) -> WithRawResponseTask&lt;PlantStrict&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests three-level allOf chain where a parent schema itself uses allOf with $ref elements. The grandparent's properties must be resolved through the nested $ref.
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
    new PlantPost
    {
        Species = "species",
        Family = "family",
        Genus = "genus",
        CommonName = "commonName",
        WateringFrequency = PlantPostWateringFrequency.Daily,
        SunExposure = PlantPostSunExposure.Full,
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

**request:** `PlantPost` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">CreateTreeAsync</a>(TreeRecord { ... }) -> WithRawResponseTask&lt;TreeRecord&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that when a parent's allOf contains multiple $ref entries, all of them are resolved and their properties merged.
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
await client.CreateTreeAsync(
    new TreeRecord
    {
        Id = "id",
        TreeName = "treeName",
        TreeSpecies = "treeSpecies",
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

**request:** `TreeRecord` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

