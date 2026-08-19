# Reference
## Status
<details><summary><code>client.status.<a href="/src/api/resources/status/client.rs">get_status</a>() -> Result&lt;StatusResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_websocket::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = WebsocketClient::new(config).expect("Failed to build client");
    client.status.get_status(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

