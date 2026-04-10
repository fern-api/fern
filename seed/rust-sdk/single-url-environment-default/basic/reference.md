# Reference
## Dummy
<details><summary><code>client.dummy.<a href="/src/api/resources/dummy/client.rs">getdummy</a>() -> Result&lt;String, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.dummy.getdummy(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

