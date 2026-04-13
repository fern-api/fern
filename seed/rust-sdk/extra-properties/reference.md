# Reference
## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">createuser</a>(request: UserCreateUserRequest) -> Result&lt;User, ApiError&gt;</code></summary>
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
        .user
        .createuser(
            &UserCreateUserRequest {
                r#type: UserCreateUserRequestType::CreateUserRequest,
                version: UserCreateUserRequestVersion::V1,
                name: "name".to_string(),
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

**type_:** `UserCreateUserRequestType` 
    
</dd>
</dl>

<dl>
<dd>

**version:** `UserCreateUserRequestVersion` 
    
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

