# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">get_with_api_key</a>() -> Result<String, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with custom api key
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
use seed_auth_environment_variables::{AuthEnvironmentVariablesClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<value>".to_string()),
        ..Default::default()
    };
    let client = AuthEnvironmentVariablesClient::new(config).expect("Failed to build client");
    client.service.get_with_api_key(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">get_with_header</a>() -> Result<String, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with custom api key
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
use seed_auth_environment_variables::{AuthEnvironmentVariablesClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<value>".to_string()),
        ..Default::default()
    };
    let client = AuthEnvironmentVariablesClient::new(config).expect("Failed to build client");
    client.service.get_with_header(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
