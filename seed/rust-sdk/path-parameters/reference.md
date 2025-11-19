# Reference
## Organizations
<details><summary><code>client.organizations.<a href="/src/api/resources/organizations/client.rs">get_organization</a>(tenant_id: String, organization_id: String) -> Result<Organization, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_path_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .organizations
        .get_organization(
            &"tenant_id".to_string(),
            &"organization_id".to_string(),
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**organization_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.organizations.<a href="/src/api/resources/organizations/client.rs">get_organization_user</a>(tenant_id: String, organization_id: String, user_id: String) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_path_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .organizations
        .get_organization_user(
            &"tenant_id".to_string(),
            &"organization_id".to_string(),
            &"user_id".to_string(),
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**organization_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.organizations.<a href="/src/api/resources/organizations/client.rs">search_organizations</a>(tenant_id: String, organization_id: String, limit: Option<Option<i64>>) -> Result<Vec<Organization>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_path_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .organizations
        .search_organizations(
            &"tenant_id".to_string(),
            &"organization_id".to_string(),
            &SearchOrganizationsQueryRequest { limit: Some(1) },
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**organization_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<i64>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">get_user</a>(tenant_id: String, user_id: String) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_path_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .user
        .get_user(&"tenant_id".to_string(), &"user_id".to_string(), None)
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">create_user</a>(tenant_id: String, request: User) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_path_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .user
        .create_user(
            &"tenant_id".to_string(),
            &User {
                name: "name".to_string(),
                tags: vec!["tags".to_string(), "tags".to_string()],
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

**tenant_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">update_user</a>(tenant_id: String, user_id: String, request: User) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_path_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .user
        .update_user(
            &"tenant_id".to_string(),
            &"user_id".to_string(),
            &UpdateUserRequest {
                body: User {
                    name: "name".to_string(),
                    tags: vec!["tags".to_string(), "tags".to_string()],
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

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">search_users</a>(tenant_id: String, user_id: String, limit: Option<Option<i64>>) -> Result<Vec<User>, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_path_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .user
        .search_users(
            &"tenant_id".to_string(),
            &"user_id".to_string(),
            &SearchUsersQueryRequest { limit: Some(1) },
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<i64>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">get_user_metadata</a>(tenant_id: String, user_id: String, version: i64) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with path parameter that has a text prefix (v{version})
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
use seed_path_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .user
        .get_user_metadata(&"tenant_id".to_string(), &"user_id".to_string(), &1, None)
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**version:** `i64` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="/src/api/resources/user/client.rs">get_user_specifics</a>(tenant_id: String, user_id: String, version: i64, thought: String) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint with path parameters listed in different order than found in path
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
use seed_path_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .user
        .get_user_specifics(
            &"tenant_id".to_string(),
            &"user_id".to_string(),
            &1,
            &"thought".to_string(),
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

**tenant_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**version:** `i64` 
    
</dd>
</dl>

<dl>
<dd>

**thought:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
