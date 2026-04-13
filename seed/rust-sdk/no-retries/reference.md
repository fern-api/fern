# Reference
## Retries
<details><summary><code>client.retries.<a href="/src/api/resources/retries/client.rs">getusers</a>() -> Result&lt;Vec&lt;User&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

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
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.retries.getusers(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

