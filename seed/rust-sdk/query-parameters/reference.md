# Reference
## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">get_username</a>(limit: Option<i64>, id: Option<String>, date: Option<String>, deadline: Option<String>, bytes: Option<String>, user: Option<User>, user_list: Option<Vec<User>>, optional_deadline: Option<Option<String>>, key_value: Option<std::collections::HashMap<String, String>>, optional_string: Option<Option<String>>, nested_user: Option<NestedUser>, optional_user: Option<Option<User>>) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use chrono::{DateTime, NaiveDate, Utc};
use seed_query_parameters::{ClientConfig, GetUsernameQueryRequest, QueryParametersClient};
use std::collections::{HashMap, HashSet};
use uuid::Uuid;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = QueryParametersClient::new(config).expect("Failed to build client");
    client
        .user
        .get_username(
            &GetUsernameQueryRequest {
                limit: 1,
                id: Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                date: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
                deadline: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                    .unwrap()
                    .with_timezone(&Utc),
                bytes: "SGVsbG8gd29ybGQh".to_string(),
                user: User {
                    name: "name".to_string(),
                    tags: vec!["tags".to_string(), "tags".to_string()],
                },
                user_list: vec![
                    User {
                        name: "name".to_string(),
                        tags: vec!["tags".to_string(), "tags".to_string()],
                    },
                    User {
                        name: "name".to_string(),
                        tags: vec!["tags".to_string(), "tags".to_string()],
                    },
                ],
                optional_deadline: Some(
                    DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                        .unwrap()
                        .with_timezone(&Utc),
                ),
                key_value: HashMap::from([("keyValue".to_string(), "keyValue".to_string())]),
                optional_string: Some("optionalString".to_string()),
                nested_user: NestedUser {
                    name: "name".to_string(),
                    user: User {
                        name: "name".to_string(),
                        tags: vec!["tags".to_string(), "tags".to_string()],
                    },
                },
                optional_user: Some(User {
                    name: "name".to_string(),
                    tags: vec!["tags".to_string(), "tags".to_string()],
                }),
                exclude_user: vec![User {
                    name: "name".to_string(),
                    tags: vec!["tags".to_string(), "tags".to_string()],
                }],
                filter: vec!["filter".to_string()],
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

**limit:** `i64` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**date:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**deadline:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**bytes:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user:** `User` 
    
</dd>
</dl>

<dl>
<dd>

**user_list:** `Vec<User>` 
    
</dd>
</dl>

<dl>
<dd>

**optional_deadline:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**key_value:** `std::collections::HashMap<String, String>` 
    
</dd>
</dl>

<dl>
<dd>

**optional_string:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**nested_user:** `NestedUser` 
    
</dd>
</dl>

<dl>
<dd>

**optional_user:** `Option<User>` 
    
</dd>
</dl>

<dl>
<dd>

**exclude_user:** `User` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
