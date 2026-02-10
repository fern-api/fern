# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">post</a>(endpoint_param: String) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_variables::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = VariablesClient::new(config).expect("Failed to build client");
    client.service.post(None).await;
}
```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**endpoint_param:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
