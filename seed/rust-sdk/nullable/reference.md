# Reference
## Nullable
<details><summary><code>client.nullable.<a href="/src/api/resources/nullable/client.rs">get_users</a>(avatar: Option<Option<String>>, extra: Option<Option<Option<bool>>>) -> Result<Vec<User>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_nullable::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableClient::new(config).expect("Failed to build client");
    client
        .nullable
        .get_users(
            &GetUsersQueryRequest {
                usernames: vec![Some("usernames".to_string())],
                avatar: Some("avatar".to_string()),
                activated: vec![Some(true)],
                tags: vec![Some(Some("tags".to_string()))],
                extra: Some(Some(true)),
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

**usernames:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**activated:** `Option<bool>` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**extra:** `Option<Option<bool>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable.<a href="/src/api/resources/nullable/client.rs">create_user</a>(request: CreateUserRequest) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_nullable::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableClient::new(config).expect("Failed to build client");
    client
        .nullable
        .create_user(
            &CreateUserRequest {
                username: "username".to_string(),
                tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                metadata: Some(Metadata {
                    created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                        .unwrap()
                        .with_timezone(&Utc),
                    updated_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                        .unwrap()
                        .with_timezone(&Utc),
                    avatar: Some("avatar".to_string()),
                    activated: Some(Some(true)),
                    status: Status::Active,
                    values: Some(HashMap::from([(
                        "values".to_string(),
                        Some(Some("values".to_string())),
                    )])),
                }),
                avatar: Some(Some("avatar".to_string())),
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

**username:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Option<Vec<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `Option<Metadata>` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `Option<Option<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable.<a href="/src/api/resources/nullable/client.rs">delete_user</a>(request: DeleteUserRequest) -> Result<bool, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_nullable::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableClient::new(config).expect("Failed to build client");
    client
        .nullable
        .delete_user(
            &DeleteUserRequest {
                username: Some(Some("xy".to_string())),
                ..Default::default()
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

**username:** `Option<Option<String>>` — The user to delete.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
