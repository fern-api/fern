# Reference
## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">getusername</a>(limit: Option&lt;i64&gt;, id: Option&lt;String&gt;, date: Option&lt;String&gt;, deadline: Option&lt;String&gt;, bytes: Option&lt;String&gt;, user: Option&lt;User&gt;, optional_deadline: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, key_value: Option&lt;std::collections::HashMap&lt;String, String&gt;&gt;, optional_string: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, nested_user: Option&lt;NestedUser&gt;, optional_user: Option&lt;Option&lt;User&gt;&gt;) -> Result&lt;User, ApiError&gt;</code></summary>
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
        .getusername(
            &GetusernameQueryRequest {
                limit: 1,
                id: "id".to_string(),
                date: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
                deadline: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                bytes: "bytes".to_string(),
                user: User {
                    name: "name".to_string(),
                    tags: vec!["tags".to_string(), "tags".to_string()],
                    ..Default::default()
                },
                user_list: vec![Some(User {
                    name: "name".to_string(),
                    tags: vec!["tags".to_string(), "tags".to_string()],
                    ..Default::default()
                })],
                optional_deadline: Some(
                    DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                ),
                key_value: HashMap::from([("keyValue".to_string(), "keyValue".to_string())]),
                optional_string: Some("optionalString".to_string()),
                nested_user: NestedUser {
                    name: "name".to_string(),
                    user: User {
                        name: "name".to_string(),
                        tags: vec!["tags".to_string(), "tags".to_string()],
                        ..Default::default()
                    },
                    ..Default::default()
                },
                optional_user: Some(User {
                    name: "name".to_string(),
                    tags: vec!["tags".to_string(), "tags".to_string()],
                    ..Default::default()
                }),
                exclude_user: vec![Some(User {
                    name: "name".to_string(),
                    tags: vec!["tags".to_string(), "tags".to_string()],
                    ..Default::default()
                })],
                filter: vec![Some("filter".to_string())],
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

**optional_deadline:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**key_value:** `std::collections::HashMap<String, String>` 
    
</dd>
</dl>

<dl>
<dd>

**optional_string:** `Option<Option<String>>` 
    
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

**exclude_user:** `Option<User>` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

