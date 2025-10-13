# Reference
## Unknown
<details><summary><code>client.unknown.<a href="/src/api/resources/unknown/client.rs">post</a>(request: serde_json::Value) -> Result<Vec<serde_json::Value>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_unknown_as_any::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UnknownAsAnyClient::new(config).expect("Failed to build client");
    client
        .unknown
        .post(&serde_json::json!({"key":"value"}), None)
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

<details><summary><code>client.unknown.<a href="/src/api/resources/unknown/client.rs">post_object</a>(request: MyObject) -> Result<Vec<serde_json::Value>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_unknown_as_any::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = UnknownAsAnyClient::new(config).expect("Failed to build client");
    client
        .unknown
        .post_object(
            &MyObject {
                unknown: serde_json::json!({"key":"value"}),
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
