# Reference
## 
<details><summary><code>client.<a href="/src/api/resources//client.rs">get</a>(type_id: TypeId) -> Result&lt;(), ApiError&gt;</code></summary>
<dl>
<dd>

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
    client..get(&TypeId("typeId".to_string()), None).await;
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

**type_id:** `TypeId` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

