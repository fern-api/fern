# Reference
## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">getuser</a>(user_id: String) -> Result&lt;(), ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.user.getuser(&"userId".to_string(), None).await;
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

<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">createuser</a>(request: UserCreateUserRequest) -> Result&lt;User, ApiError&gt;</code></summary>
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
                name: "name".to_string(),
                age: None,
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

**age:** `Option<Option<i64>>` 

The age of the user.
This property is not required.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

