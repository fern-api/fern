# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">get_text</a>() -> Result<String, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_plain_text::{ClientConfig, PlainTextClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PlainTextClient::new(config).expect("Failed to build client");
    client.service.get_text(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
