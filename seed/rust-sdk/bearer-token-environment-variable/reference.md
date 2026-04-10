# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">getwithbearertoken</a>() -> Result&lt;String, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.service.getwithbearertoken(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

