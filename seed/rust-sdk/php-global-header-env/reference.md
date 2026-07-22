# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">get_with_api_version</a>() -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request with a version header
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
use seed_php_global_header_env::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PhpGlobalHeaderEnvClient::new(config).expect("Failed to build client");
    client.service.get_with_api_version(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

