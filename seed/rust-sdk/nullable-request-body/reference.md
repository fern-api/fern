# Reference
## TestGroup
<details><summary><code>client.test_group.<a href="/src/api/resources/test_group/client.rs">test_method_name</a>(path_param: String, request: Option<PlainObject>, query_param_object: Option<Option<Option<PlainObject>>>, query_param_integer: Option<Option<Option<i64>>>) -> Result<serde_json::Value, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Post a nullable request body
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
use seed_api::PlainObject;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .test_group
        .test_method_name(
            &"path_param".to_string(),
            &TestMethodNameRequest {
                body: Some(PlainObject {
                    id: None,
                    name: None,
                }),
                query_param_object: None,
                query_param_integer: None,
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

**path_param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**query_param_object:** `Option<Option<PlainObject>>` 
    
</dd>
</dl>

<dl>
<dd>

**query_param_integer:** `Option<Option<i64>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
