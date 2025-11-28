# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">list_resources</a>(page: Option<i64>, per_page: Option<i64>, sort: Option<String>, order: Option<String>, include_totals: Option<bool>, fields: Option<Option<String>>, search: Option<Option<String>>) -> Result<Vec<Resource>, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List resources with pagination
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
use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .list_resources(
            &ListResourcesQueryRequest {
                page: 1,
                per_page: 1,
                sort: "created_at".to_string(),
                order: "desc".to_string(),
                include_totals: true,
                fields: Some("fields".to_string()),
                search: Some("search".to_string()),
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

**page:** `i64` — Zero-indexed page number
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `i64` — Number of items per page
    
</dd>
</dl>

<dl>
<dd>

**sort:** `String` — Sort field
    
</dd>
</dl>

<dl>
<dd>

**order:** `String` — Sort order (asc or desc)
    
</dd>
</dl>

<dl>
<dd>

**include_totals:** `bool` — Whether to include total count
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Option<String>` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**search:** `Option<String>` — Search query
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">get_resource</a>(resource_id: String, include_metadata: Option<bool>, format: Option<String>) -> Result<Resource, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a single resource
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
use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .get_resource(
            &"resourceId".to_string(),
            &GetResourceQueryRequest {
                include_metadata: true,
                format: "json".to_string(),
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

**resource_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**include_metadata:** `bool` — Include metadata in response
    
</dd>
</dl>

<dl>
<dd>

**format:** `String` — Response format
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">search_resources</a>(request: SearchResourcesRequest, limit: Option<i64>, offset: Option<i64>) -> Result<SearchResponse, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search resources with complex parameters
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
use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .search_resources(
            &SearchResourcesRequest {
                limit: 1,
                offset: 1,
                query: Some("query".to_string()),
                filters: Some(HashMap::from([(
                    "filters".to_string(),
                    serde_json::json!({"key":"value"}),
                )])),
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

**query:** `Option<String>` — Search query text
    
</dd>
</dl>

<dl>
<dd>

**filters:** `Option<std::collections::HashMap<String, serde_json::Value>>` 
    
</dd>
</dl>

<dl>
<dd>

**limit:** `i64` — Maximum results to return
    
</dd>
</dl>

<dl>
<dd>

**offset:** `i64` — Offset for pagination
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">list_users</a>(page: Option<Option<i64>>, per_page: Option<Option<i64>>, include_totals: Option<Option<bool>>, sort: Option<Option<String>>, connection: Option<Option<String>>, q: Option<Option<String>>, search_engine: Option<Option<String>>, fields: Option<Option<String>>) -> Result<PaginatedUserResponse, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List or search for users
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
use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .list_users(
            &ListUsersQueryRequest {
                page: Some(1),
                per_page: Some(1),
                include_totals: Some(true),
                sort: Some("sort".to_string()),
                connection: Some("connection".to_string()),
                q: Some("q".to_string()),
                search_engine: Some("search_engine".to_string()),
                fields: Some("fields".to_string()),
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

**page:** `Option<i64>` — Page index of the results to return. First page is 0.
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<i64>` — Number of results per page.
    
</dd>
</dl>

<dl>
<dd>

**include_totals:** `Option<bool>` — Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    
</dd>
</dl>

<dl>
<dd>

**sort:** `Option<String>` — Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    
</dd>
</dl>

<dl>
<dd>

**connection:** `Option<String>` — Connection filter
    
</dd>
</dl>

<dl>
<dd>

**q:** `Option<String>` — Query string following Lucene query string syntax
    
</dd>
</dl>

<dl>
<dd>

**search_engine:** `Option<String>` — Search engine version (v1, v2, or v3)
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Option<String>` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">get_user_by_id</a>(user_id: String, fields: Option<Option<String>>, include_fields: Option<Option<bool>>) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a user by ID
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
use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .get_user_by_id(
            &"userId".to_string(),
            &GetUserByIdQueryRequest {
                fields: Some("fields".to_string()),
                include_fields: Some(true),
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

**user_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Option<String>` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>

<dl>
<dd>

**include_fields:** `Option<bool>` — true to include the fields specified, false to exclude them
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">create_user</a>(request: CreateUserRequest) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new user
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
use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .create_user(
            &CreateUserRequest {
                email: "email".to_string(),
                email_verified: Some(true),
                username: Some("username".to_string()),
                password: Some("password".to_string()),
                phone_number: Some("phone_number".to_string()),
                phone_verified: Some(true),
                user_metadata: Some(HashMap::from([(
                    "user_metadata".to_string(),
                    serde_json::json!({"key":"value"}),
                )])),
                app_metadata: Some(HashMap::from([(
                    "app_metadata".to_string(),
                    serde_json::json!({"key":"value"}),
                )])),
                connection: "connection".to_string(),
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">update_user</a>(user_id: String, request: UpdateUserRequest) -> Result<User, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a user
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
use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .update_user(
            &"userId".to_string(),
            &UpdateUserRequest {
                email: Some("email".to_string()),
                email_verified: Some(true),
                username: Some("username".to_string()),
                phone_number: Some("phone_number".to_string()),
                phone_verified: Some(true),
                user_metadata: Some(HashMap::from([(
                    "user_metadata".to_string(),
                    serde_json::json!({"key":"value"}),
                )])),
                app_metadata: Some(HashMap::from([(
                    "app_metadata".to_string(),
                    serde_json::json!({"key":"value"}),
                )])),
                password: Some("password".to_string()),
                blocked: Some(true),
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

**user_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">delete_user</a>(user_id: String) -> Result<(), ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a user
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
use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .delete_user(&"userId".to_string(), None)
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

**user_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">list_connections</a>(strategy: Option<Option<String>>, name: Option<Option<String>>, fields: Option<Option<String>>) -> Result<Vec<Connection>, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all connections
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
use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .list_connections(
            &ListConnectionsQueryRequest {
                strategy: Some("strategy".to_string()),
                name: Some("name".to_string()),
                fields: Some("fields".to_string()),
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

**strategy:** `Option<String>` — Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    
</dd>
</dl>

<dl>
<dd>

**name:** `Option<String>` — Filter by connection name
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Option<String>` — Comma-separated list of fields to include
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">get_connection</a>(connection_id: String, fields: Option<Option<String>>) -> Result<Connection, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a connection by ID
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
use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .get_connection(
            &"connectionId".to_string(),
            &GetConnectionQueryRequest {
                fields: Some("fields".to_string()),
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

**connection_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Option<String>` — Comma-separated list of fields to include
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">list_clients</a>(fields: Option<Option<String>>, include_fields: Option<Option<bool>>, page: Option<Option<i64>>, per_page: Option<Option<i64>>, include_totals: Option<Option<bool>>, is_global: Option<Option<bool>>, is_first_party: Option<Option<bool>>, app_type: Option<Option<Vec<String>>>) -> Result<PaginatedClientResponse, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all clients/applications
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
use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .list_clients(
            &ListClientsQueryRequest {
                fields: Some("fields".to_string()),
                include_fields: Some(true),
                page: Some(1),
                per_page: Some(1),
                include_totals: Some(true),
                is_global: Some(true),
                is_first_party: Some(true),
                app_type: Some(vec!["app_type".to_string(), "app_type".to_string()]),
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

**fields:** `Option<String>` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**include_fields:** `Option<bool>` — Whether specified fields are included or excluded
    
</dd>
</dl>

<dl>
<dd>

**page:** `Option<i64>` — Page number (zero-based)
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<i64>` — Number of results per page
    
</dd>
</dl>

<dl>
<dd>

**include_totals:** `Option<bool>` — Include total count in response
    
</dd>
</dl>

<dl>
<dd>

**is_global:** `Option<bool>` — Filter by global clients
    
</dd>
</dl>

<dl>
<dd>

**is_first_party:** `Option<bool>` — Filter by first party clients
    
</dd>
</dl>

<dl>
<dd>

**app_type:** `Option<Vec<String>>` — Filter by application type (spa, native, regular_web, non_interactive)
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">get_client</a>(client_id: String, fields: Option<Option<String>>, include_fields: Option<Option<bool>>) -> Result<Client, ApiError></code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a client by ID
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
use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .get_client(
            &"clientId".to_string(),
            &GetClientQueryRequest {
                fields: Some("fields".to_string()),
                include_fields: Some(true),
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

**client_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Option<String>` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**include_fields:** `Option<bool>` — Whether specified fields are included or excluded
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
