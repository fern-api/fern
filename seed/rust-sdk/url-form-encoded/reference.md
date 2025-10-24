# Reference
<details><summary><code>client.<a href="/src/client.rs">submit_form_data</a>(request: PostSubmitRequest) -> Result<PostSubmitResponse, ApiError></code></summary>
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
    client
        .submit_form_data(
            &PostSubmitRequest {
                username: "johndoe".to_string(),
                email: "john@example.com".to_string(),
            },
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

**username:** `String` — The user's username
    
</dd>
</dl>

<dl>
<dd>

**email:** `String` — The user's email address
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
