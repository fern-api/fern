# Reference
## CustomAuth
<details><summary><code>client.custom_auth.<a href="/src/api/resources/custom_auth/client.rs">get_with_custom_auth</a>() -> Result<bool, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with custom auth scheme
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
use seed_custom_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<value>".to_string()),
        ..Default::default()
    };
    let client = CustomAuthClient::new(config).expect("Failed to build client");
    client.custom_auth.get_with_custom_auth(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.custom_auth.<a href="/src/api/resources/custom_auth/client.rs">post_with_custom_auth</a>(request: serde_json::Value) -> Result<bool, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with custom auth scheme
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
use seed_custom_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<value>".to_string()),
        ..Default::default()
    };
    let client = CustomAuthClient::new(config).expect("Failed to build client");
    client
        .custom_auth
        .post_with_custom_auth(&serde_json::json!({"key":"value"}), None)
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
