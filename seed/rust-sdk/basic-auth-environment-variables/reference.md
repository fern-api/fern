# Reference
## BasicAuth
<details><summary><code>client.basic_auth.<a href="/src/api/resources/basic_auth/client.rs">get_with_basic_auth</a>() -> Result<bool, ApiError></code></summary>
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
use seed_basic_auth_environment_variables::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        username: Some("<username>".to_string()),
        password: Some("<password>".to_string()),
        ..Default::default()
    };
    let client = BasicAuthEnvironmentVariablesClient::new(config).expect("Failed to build client");
    client.basic_auth.get_with_basic_auth(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.basic_auth.<a href="/src/api/resources/basic_auth/client.rs">post_with_basic_auth</a>(request: serde_json::Value) -> Result<bool, ApiError></code></summary>
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
use seed_basic_auth_environment_variables::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        username: Some("<username>".to_string()),
        password: Some("<password>".to_string()),
        ..Default::default()
    };
    let client = BasicAuthEnvironmentVariablesClient::new(config).expect("Failed to build client");
    client
        .basic_auth
        .post_with_basic_auth(&serde_json::json!({"key":"value"}), None)
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
