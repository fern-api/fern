# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">upload</a>() -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_bytes_upload::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = BytesUploadClient::new(config).expect("Failed to build client");
    client
        .service
        .upload(&todo!("Invalid bytes value"), None)
        .await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
