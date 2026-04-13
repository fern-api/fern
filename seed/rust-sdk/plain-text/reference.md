# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">gettext</a>() -> Result&lt;String, ApiError&gt;</code></summary>
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
    client.service.gettext(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

