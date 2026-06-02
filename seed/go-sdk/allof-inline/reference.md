# Reference
<details><summary><code>client.SearchRuleTypes() -> *fern.RuleTypeSearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.SearchRuleTypesRequest{}
client.SearchRuleTypes(
        context.TODO(),
        request,
    )
}
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**query:** `*string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.CreateRule(request) -> *fern.RuleResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.RuleCreateRequest{
        Name: "name",
        ExecutionContext: fern.RuleCreateRequestExecutionContextProd,
    }
client.CreateRule(
        context.TODO(),
        request,
    )
}
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**name:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**executionContext:** `*fern.RuleCreateRequestExecutionContext` — Execution context for the rule, excluding the prod environment.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.ListUsers() -> *fern.UserSearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.ListUsers(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.GetEntity() -> *fern.CombinedEntity</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.GetEntity(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.GetOrganization() -> *fern.Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.GetOrganization(
        context.TODO(),
    )
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.CreatePlant(request) -> *fern.PlantStrict</code></summary>
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

```go
request := &fern.PlantPost{
        Species: "species",
        Family: "family",
        Genus: "genus",
        CommonName: "commonName",
        WateringFrequency: fern.PlantPostWateringFrequencyDaily,
        SunExposure: fern.PlantPostSunExposureFull,
    }
client.CreatePlant(
        context.TODO(),
        request,
    )
}
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**species:** `string` — The botanical species name.
    
</dd>
</dl>

<dl>
<dd>

**family:** `string` — The botanical family.
    
</dd>
</dl>

<dl>
<dd>

**genus:** `string` — The botanical genus.
    
</dd>
</dl>

<dl>
<dd>

**commonName:** `string` — The common name of the plant.
    
</dd>
</dl>

<dl>
<dd>

**wateringFrequency:** `*fern.PlantPostWateringFrequency` 
    
</dd>
</dl>

<dl>
<dd>

**sunExposure:** `*fern.PlantPostSunExposure` — Required sun exposure level.
    
</dd>
</dl>

<dl>
<dd>

**plantedAt:** `*time.Time` — Date the plant was planted.
    
</dd>
</dl>

<dl>
<dd>

**soilType:** `*string` — Preferred soil type.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.CreateTree(request) -> *fern.TreeRecord</code></summary>
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

```go
request := &fern.TreeRecord{
        ID: "id",
        TreeName: "treeName",
        TreeSpecies: "treeSpecies",
    }
client.CreateTree(
        context.TODO(),
        request,
    )
}
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `*fern.TreeRecord` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

