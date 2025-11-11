# Reference
## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">create_user</a>(request: CreateUserRequest) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_extra_properties::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ExtraPropertiesClient::new(config).expect("Failed to build client");
    client
        .user
        .create_user(
            &CreateUserRequest {
                name: "Alice".to_string(),
                r#type: "CreateUserRequest".to_string(),
                version: "v1".to_string(),
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

**type_:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**version:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
