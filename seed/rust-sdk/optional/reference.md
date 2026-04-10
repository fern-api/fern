# Reference
## Optional
<details><summary><code>client.optional.<a href="/src/api/resources/optional/client.rs">sendoptionalbody</a>(request: Option&lt;std::collections::HashMap&lt;String, serde_json::Value&gt;&gt;) -> Result&lt;String, ApiError&gt;</code></summary>
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
        .optional
        .sendoptionalbody(
            &Some(HashMap::from([(
                "key".to_string(),
                serde_json::json!("value"),
            )])),
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

<details><summary><code>client.optional.<a href="/src/api/resources/optional/client.rs">sendoptionaltypedbody</a>(request: SendOptionalBodyRequest) -> Result&lt;String, ApiError&gt;</code></summary>
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
        .optional
        .sendoptionaltypedbody(
            &SendOptionalBodyRequest {
                message: "message".to_string(),
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

**message:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.optional.<a href="/src/api/resources/optional/client.rs">sendoptionalnullablewithalloptionalproperties</a>(action_id: String, id: String, request: DeployParams) -> Result&lt;DeployResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests optional(nullable(T)) where T has only optional properties.
This should not generate wire tests expecting {} when Optional.empty() is passed.
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
        .optional
        .sendoptionalnullablewithalloptionalproperties(
            &"actionId".to_string(),
            &"id".to_string(),
            &DeployParams {
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

**action_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**update_draft:** `Option<Option<bool>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

