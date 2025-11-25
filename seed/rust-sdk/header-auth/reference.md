# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">get_with_bearer_token</a>() -> Result<String, ApiError></code></summary>
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
use seed_header_token::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<value>".to_string()),
        ..Default::default()
    };
    let client = HeaderTokenClient::new(config).expect("Failed to build client");
    client.service.get_with_bearer_token(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
