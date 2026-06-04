# Reference
<details><summary><code>$client-&gt;searchRuleTypes($request) -> ?RuleTypeSearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->searchRuleTypes(
    new SearchRuleTypesRequest([]),
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

**$query:** `?string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;createRule($request) -> ?RuleResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->createRule(
    new RuleCreateRequest([
        'name' => 'name',
        'executionContext' => RuleCreateRequestExecutionContext::Prod->value,
    ]),
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

**$name:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$executionContext:** `string` — Execution context for the rule, excluding the prod environment.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;listUsers() -> ?UserSearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->listUsers();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;getEntity() -> ?CombinedEntity</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->getEntity();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;getOrganization() -> ?Organization</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->getOrganization();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;createPlant($request) -> ?PlantStrict</code></summary>
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

```php
$client->createPlant(
    new PlantPost([
        'species' => 'species',
        'family' => 'family',
        'genus' => 'genus',
        'commonName' => 'commonName',
        'wateringFrequency' => PlantPostWateringFrequency::Daily->value,
        'sunExposure' => PlantPostSunExposure::Full->value,
    ]),
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

**$species:** `string` — The botanical species name.
    
</dd>
</dl>

<dl>
<dd>

**$family:** `string` — The botanical family.
    
</dd>
</dl>

<dl>
<dd>

**$genus:** `string` — The botanical genus.
    
</dd>
</dl>

<dl>
<dd>

**$commonName:** `string` — The common name of the plant.
    
</dd>
</dl>

<dl>
<dd>

**$wateringFrequency:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$sunExposure:** `string` — Required sun exposure level.
    
</dd>
</dl>

<dl>
<dd>

**$plantedAt:** `?DateTime` — Date the plant was planted.
    
</dd>
</dl>

<dl>
<dd>

**$soilType:** `?string` — Preferred soil type.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;createTree($request) -> ?TreeRecord</code></summary>
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

```php
$client->createTree(
    new TreeRecord([
        'id' => 'id',
        'treeName' => 'treeName',
        'treeSpecies' => 'treeSpecies',
    ]),
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

**$request:** `TreeRecord` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

