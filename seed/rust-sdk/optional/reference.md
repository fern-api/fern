# Reference
## Optional
<details><summary><code>client.optional.<a href="/src/api/resources/optional/client.rs">send_optional_body</a>(request: Option<std::collections::HashMap<String, serde_json::Value>>) -> Result<String, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_objects_with_imports::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ObjectsWithImportsClient::new(config).expect("Failed to build client");
    client
        .optional
        .send_optional_body(
            &Some(HashMap::from([(
                "string".to_string(),
                serde_json::json!({"key":"value"}),
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

<details><summary><code>client.optional.<a href="/src/api/resources/optional/client.rs">send_optional_typed_body</a>(request: Option<SendOptionalBodyRequest>) -> Result<String, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_objects_with_imports::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ObjectsWithImportsClient::new(config).expect("Failed to build client");
    client
        .optional
        .send_optional_typed_body(
            &Some(SendOptionalBodyRequest {
                message: "message".to_string(),
            }),
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

<details><summary><code>client.optional.<a href="/src/api/resources/optional/client.rs">send_optional_nullable_with_all_optional_properties</a>(action_id: String, id: String, request: Option<Option<DeployParams>>) -> Result<DeployResponse, ApiError></code></summary>
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
use seed_objects_with_imports::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ObjectsWithImportsClient::new(config).expect("Failed to build client");
    client
        .optional
        .send_optional_nullable_with_all_optional_properties(
            &"actionId".to_string(),
            &"id".to_string(),
            &Some(Some(DeployParams {
                update_draft: Some(true),
            })),
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
</dd>
</dl>


</dd>
</dl>
</details>
