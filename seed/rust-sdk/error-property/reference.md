# Reference
## PropertyBasedError
<details><summary><code>client.property_based_error.<a href="/src/api/resources/property_based_error/client.rs">throw_error</a>() -> Result&lt;String, ApiError&gt;</code></summary>
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
use seed_error_property::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ErrorPropertyClient::new(config).expect("Failed to build client");
    client.property_based_error.throw_error(None).await;
}
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
