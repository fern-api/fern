# Reference
## Basicauth
<details><summary><code>client.basicauth.<a href="/src/api/resources/basicauth/client.rs">getwithbasicauth</a>() -> Result&lt;bool, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with basic auth scheme
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
        username: Some("<username>".to_string()),
        password: Some("<password>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.basicauth.getwithbasicauth(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.basicauth.<a href="/src/api/resources/basicauth/client.rs">postwithbasicauth</a>(request: serde_json::Value) -> Result&lt;bool, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with basic auth scheme
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
        username: Some("<username>".to_string()),
        password: Some("<password>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .basicauth
        .postwithbasicauth(&serde_json::json!({"key":"value"}), None)
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

