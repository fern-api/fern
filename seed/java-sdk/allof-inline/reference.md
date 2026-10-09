# Reference
<details><summary><code>client.searchRuleTypes() -> RuleTypeSearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.searchRuleTypes(
    SearchRuleTypesRequest
        .builder()
        .build()
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

**query:** `Optional<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.createRule(request) -> RuleResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.createRule(
    RuleCreateRequest
        .builder()
        .name("name")
        .executionContext(RuleCreateRequestExecutionContext.PROD)
        .build()
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

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**executionContext:** `RuleCreateRequestExecutionContext` — Execution context for the rule, excluding the prod environment.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.listUsers() -> UserSearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.listUsers();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.getEntity() -> CombinedEntity</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.getEntity();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.getOrganization() -> Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.getOrganization();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.createPlant(request) -> PlantStrict</code></summary>
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

```java
client.createPlant(
    PlantPost
        .builder()
        .species("species")
        .family("family")
        .genus("genus")
        .commonName("commonName")
        .wateringFrequency(PlantPostWateringFrequency.DAILY)
        .sunExposure(PlantPostSunExposure.FULL)
        .build()
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

**species:** `String` — The botanical species name.
    
</dd>
</dl>

<dl>
<dd>

**family:** `String` — The botanical family.
    
</dd>
</dl>

<dl>
<dd>

**genus:** `String` — The botanical genus.
    
</dd>
</dl>

<dl>
<dd>

**commonName:** `String` — The common name of the plant.
    
</dd>
</dl>

<dl>
<dd>

**wateringFrequency:** `PlantPostWateringFrequency` 
    
</dd>
</dl>

<dl>
<dd>

**sunExposure:** `PlantPostSunExposure` — Required sun exposure level.
    
</dd>
</dl>

<dl>
<dd>

**plantedAt:** `Optional<String>` — Date the plant was planted.
    
</dd>
</dl>

<dl>
<dd>

**soilType:** `Optional<String>` — Preferred soil type.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.createTree(request) -> TreeRecord</code></summary>
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

```java
client.createTree(
    TreeRecord
        .builder()
        .id("id")
        .treeName("treeName")
        .treeSpecies("treeSpecies")
        .build()
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

