# Reference
## Dummy
<details><summary><code>client.dummy.<a href="/src/api/resources/dummy/client.rs">get_dummy</a>() -> Result<String, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_single_url_environment_default::{ClientConfig, SingleUrlEnvironmentDefaultClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = SingleUrlEnvironmentDefaultClient::new(config).expect("Failed to build client");
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
