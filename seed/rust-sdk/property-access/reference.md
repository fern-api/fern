# Reference
<details><summary><code>client.<a href="/src/client.rs">create_user</a>(request: User) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_property_access::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PropertyAccessClient::new(config).expect("Failed to build client");
    client
        .create_user(
            &User {
                id: "id".to_string(),
                email: "email".to_string(),
                password: "password".to_string(),
                profile: UserProfile {
                    name: "name".to_string(),
                    verification: UserProfileVerification {
                        verified: "verified".to_string(),
                    },
                    ssn: "ssn".to_string(),
                },
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


</dd>
</dl>
</details>
