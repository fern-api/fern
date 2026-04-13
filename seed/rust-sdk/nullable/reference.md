# Reference
## Nullable
<details><summary><code>client.nullable.<a href="/src/api/resources/nullable/client.rs">getusers</a>(avatar: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, extra: Option&lt;Option&lt;Option&lt;bool&gt;&gt;&gt;) -> Result&lt;Vec&lt;User&gt;, ApiError&gt;</code></summary>
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
        .nullable
        .getusers(
            &GetusersQueryRequest {
                usernames: vec![],
                avatar: None,
                activated: vec![],
                tags: vec![],
                extra: None,
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

**usernames:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**activated:** `Option<Option<bool>>` 
    
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

<details><summary><code>client.nullable.<a href="/src/api/resources/nullable/client.rs">createuser</a>(request: NullableCreateUserRequest) -> Result&lt;User, ApiError&gt;</code></summary>
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
        .nullable
        .createuser(
            &NullableCreateUserRequest {
                username: "username".to_string(),
                tags: None,
                metadata: None,
                avatar: None,
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

**tags:** `Option<Option<Vec<String>>>` 
    
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

<details><summary><code>client.nullable.<a href="/src/api/resources/nullable/client.rs">deleteuser</a>(request: NullableDeleteUserRequest) -> Result&lt;bool, ApiError&gt;</code></summary>
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
        .nullable
        .deleteuser(
            &NullableDeleteUserRequest {
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

