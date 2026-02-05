# Reference
## Dummy
<details><summary><code>client.dummy.<a href="/src/api/resources/dummy/client.rs">get_dummy</a>() -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_no_environment::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = NoEnvironmentClient::new(config).expect("Failed to build client");
    client.dummy.get_dummy(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
