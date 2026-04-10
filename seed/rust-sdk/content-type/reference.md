# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">patch</a>(request: ServicePatchRequest) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .patch(
            &ServicePatchRequest {
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

**application:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**require_auth:** `Option<bool>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">patchcomplex</a>(id: String, request: ServicePatchComplexRequest) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update with JSON merge patch - complex types.
This endpoint demonstrates the distinction between:
- optional<T> fields (can be present or absent, but not null)
- optional<nullable<T>> fields (can be present, absent, or null)
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .patchcomplex(
            &"id".to_string(),
            &ServicePatchComplexRequest {
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**age:** `Option<Option<i64>>` 
    
</dd>
</dl>

<dl>
<dd>

**active:** `Option<Option<bool>>` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `Option<Option<std::collections::HashMap<String, serde_json::Value>>>` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Option<Option<Vec<String>>>` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**nickname:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**bio:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**profile_image_url:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**settings:** `Option<Option<std::collections::HashMap<String, serde_json::Value>>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">namedpatchwithmixed</a>(id: String, request: ServiceNamedPatchWithMixedRequest) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Named request with mixed optional/nullable fields and merge-patch content type.
This should trigger the NPE issue when optional fields aren't initialized.
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .namedpatchwithmixed(
            &"id".to_string(),
            &ServiceNamedPatchWithMixedRequest {
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**app_id:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**instructions:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**active:** `Option<bool>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">optionalmergepatchtest</a>(request: ServiceOptionalMergePatchTestRequest) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
This endpoint should:
1. Not NPE when fields are not provided (tests initialization)
2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .optionalmergepatchtest(
            &ServiceOptionalMergePatchTestRequest {
                required_field: "requiredField".to_string(),
                optional_string: None,
                optional_integer: None,
                optional_boolean: None,
                nullable_string: None,
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

**required_field:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optional_string:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**optional_integer:** `Option<Option<i64>>` 
    
</dd>
</dl>

<dl>
<dd>

**optional_boolean:** `Option<Option<bool>>` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_string:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">regularpatch</a>(id: String, request: ServiceRegularPatchRequest) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Regular PATCH endpoint without merge-patch semantics
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .regularpatch(
            &"id".to_string(),
            &ServiceRegularPatchRequest {
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**field1:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**field2:** `Option<Option<i64>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

