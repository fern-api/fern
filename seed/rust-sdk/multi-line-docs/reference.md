# Reference
## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">get_user</a>(user_id: String) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a user.
This endpoint is used to retrieve a user.
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
use seed_multi_line_docs::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = MultiLineDocsClient::new(config).expect("Failed to build client");
    client.user.get_user(&"userId".to_string(), None).await;
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

**user_id:** `String` 

The ID of the user to retrieve.
This ID is unique to each user.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">create_user</a>(request: CreateUserRequest) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new user.
This endpoint is used to create a new user.
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
use seed_multi_line_docs::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = MultiLineDocsClient::new(config).expect("Failed to build client");
    client
        .user
        .create_user(
            &CreateUserRequest {
                name: "name".to_string(),
                age: Some(1),
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

**name:** `String` 

The name of the user to create.
This name is unique to each user.
    
</dd>
</dl>

<dl>
<dd>

**age:** `Option<i64>` 

The age of the user.
This property is not required.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
