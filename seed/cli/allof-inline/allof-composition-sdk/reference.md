# Reference
<details><summary><code>client.<a href="/src/client.rs">search_rule_types</a>(query: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;RuleTypeSearchResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use allof_composition_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = AllofCompositionClient::new(config).expect("Failed to build client");
    client
        .search_rule_types(
            &SearchRuleTypesQueryRequest {
                ..Default::default()
            },
            None,
        )
        .await;
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

**query:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">create_rule</a>(request: RuleCreateRequest) -> Result&lt;RuleResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use allof_composition_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = AllofCompositionClient::new(config).expect("Failed to build client");
    client
        .create_rule(
            &RuleCreateRequest {
                name: "name".to_string(),
                execution_context: RuleCreateRequestExecutionContext::Prod,
            },
            None,
        )
        .await;
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

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**execution_context:** `RuleCreateRequestExecutionContext` — Execution context for the rule, excluding the prod environment.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">list_users</a>() -> Result&lt;UserSearchResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use allof_composition_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = AllofCompositionClient::new(config).expect("Failed to build client");
    client.list_users(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">get_entity</a>() -> Result&lt;CombinedEntity, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use allof_composition_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = AllofCompositionClient::new(config).expect("Failed to build client");
    client.get_entity(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">get_organization</a>() -> Result&lt;Organization, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use allof_composition_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = AllofCompositionClient::new(config).expect("Failed to build client");
    client.get_organization(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">create_plant</a>(request: PlantPost) -> Result&lt;PlantStrict, ApiError&gt;</code></summary>
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

```rust
use allof_composition_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = AllofCompositionClient::new(config).expect("Failed to build client");
    client
        .create_plant(
            &PlantPost {
                species: "species".to_string(),
                family: "family".to_string(),
                genus: "genus".to_string(),
                common_name: "commonName".to_string(),
                watering_frequency: PlantPostWateringFrequency::Daily,
                sun_exposure: PlantPostSunExposure::Full,
                planted_at: None,
                soil_type: None,
            },
            None,
        )
        .await;
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

**common_name:** `String` — The common name of the plant.
    
</dd>
</dl>

<dl>
<dd>

**watering_frequency:** `PlantPostWateringFrequency` 
    
</dd>
</dl>

<dl>
<dd>

**sun_exposure:** `PlantPostSunExposure` — Required sun exposure level.
    
</dd>
</dl>

<dl>
<dd>

**planted_at:** `Option<String>` — Date the plant was planted.
    
</dd>
</dl>

<dl>
<dd>

**soil_type:** `Option<String>` — Preferred soil type.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/client.rs">create_tree</a>(request: TreeRecord) -> Result&lt;TreeRecord, ApiError&gt;</code></summary>
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

```rust
use allof_composition_sdk::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = AllofCompositionClient::new(config).expect("Failed to build client");
    client
        .create_tree(
            &TreeRecord {
                id: "id".to_string(),
                tree_name: "treeName".to_string(),
                tree_species: "treeSpecies".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

