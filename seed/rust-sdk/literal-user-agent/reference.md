# Reference
<details><summary><code>client.<a href="/src/client.rs">ping</a>() -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_literal_user_agent::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = LiteralUserAgentClient::new(config).expect("Failed to build client");
    client.ping(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

