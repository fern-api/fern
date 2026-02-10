# Reference
## Retries
<details><summary><code>client.retries.<a href="/src/api/resources/retries/client.rs">get_users</a>() -> Result&lt;Vec&lt;User&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_no_retries::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NoRetriesClient::new(config).expect("Failed to build client");
    client.retries.get_users(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
