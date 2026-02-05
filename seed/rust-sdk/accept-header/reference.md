# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">endpoint</a>() -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_accept::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = AcceptClient::new(config).expect("Failed to build client");
    client.service.endpoint(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
