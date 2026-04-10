# Reference
## Propertybasederror
<details><summary><code>client.propertybasederror.<a href="/src/api/resources/propertybasederror/client.rs">throwerror</a>() -> Result&lt;String, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET request that always throws an error
</dd>
</dl>
</dd>
</dl>

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
    client.propertybasederror.throwerror(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

