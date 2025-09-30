# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">post</a>(path_param: String, service_param: String, resource_param: String, endpoint_param: i64) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_api_wide_base_path::{ApiWideBasePathClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiWideBasePathClient::new(config).expect("Failed to build client");
    client
        .service
        .post(
            &"pathParam".to_string(),
            &"serviceParam".to_string(),
            &"resourceParam".to_string(),
            &1,
            None,
        )
        .await;
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

**path_param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**service_param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**resource_param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**endpoint_param:** `i64` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
