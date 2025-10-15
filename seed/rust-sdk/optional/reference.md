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
