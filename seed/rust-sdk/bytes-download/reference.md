# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">simple</a>() -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_bytes_download::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = BytesDownloadClient::new(config).expect("Failed to build client");
    client.service.simple(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
