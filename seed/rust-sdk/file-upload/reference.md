# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">simple</a>() -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_file_upload::{ClientConfig, FileUploadClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = FileUploadClient::new(config).expect("Failed to build client");
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
