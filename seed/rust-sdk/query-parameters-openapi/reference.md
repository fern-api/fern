# Reference
<details><summary><code>client.<a href="/src/client.rs">search</a>(limit: Option<i64>, id: Option<String>, date: Option<String>, deadline: Option<String>, bytes: Option<String>, user: Option<User>, optional_deadline: Option<Option<String>>, key_value: Option<Option<std::collections::HashMap<String, Option<String>>>>, optional_string: Option<Option<String>>, nested_user: Option<Option<NestedUser>>, optional_user: Option<Option<User>>, neighbor: Option<Option<User>>, neighbor_required: Option<SearchRequestNeighborRequired>) -> Result<SearchResponse, ApiError></code></summary>
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
        .search(
            &SearchQueryRequest {
                limit: 1,
                id: "id".to_string(),
                date: "date".to_string(),
                deadline: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                    .unwrap()
                    .with_timezone(&Utc),
                bytes: "bytes".to_string(),
                user: User {
                    name: Some("name".to_string()),
                    tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                },
                user_list: vec![Some(User {
                    name: Some("name".to_string()),
                    tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                })],
                optional_deadline: Some(
                    DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                        .unwrap()
                        .with_timezone(&Utc),
                ),
                key_value: Some(HashMap::from([(
                    "keyValue".to_string(),
                    Some("keyValue".to_string()),
                )])),
                optional_string: Some("optionalString".to_string()),
                nested_user: Some(NestedUser {
                    name: Some("name".to_string()),
                    user: Some(User {
                        name: Some("name".to_string()),
                        tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                    }),
                }),
                optional_user: Some(User {
                    name: Some("name".to_string()),
                    tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                }),
                exclude_user: vec![Some(User {
                    name: Some("name".to_string()),
                    tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                })],
                filter: vec![Some("filter".to_string())],
                neighbor: Some(User {
                    name: Some("name".to_string()),
                    tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                }),
                neighbor_required: SearchRequestNeighborRequired::User(User {
                    name: Some("name".to_string()),
                    tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                }),
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

**user_list:** `Option<User>` 
    
</dd>
</dl>

<dl>
<dd>

**optional_deadline:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**key_value:** `Option<std::collections::HashMap<String, Option<String>>>` 
    
</dd>
</dl>

<dl>
<dd>

**optional_string:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**nested_user:** `Option<NestedUser>` 
    
</dd>
</dl>

<dl>
<dd>

**optional_user:** `Option<User>` 
    
</dd>
</dl>

<dl>
<dd>

**exclude_user:** `Option<User>` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**neighbor:** `Option<User>` 
    
</dd>
</dl>

<dl>
<dd>

**neighbor_required:** `SearchRequestNeighborRequired` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
