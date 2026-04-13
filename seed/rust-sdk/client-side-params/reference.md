# Reference
## Service
<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">listresources</a>(page: Option&lt;i64&gt;, per_page: Option&lt;i64&gt;, sort: Option&lt;String&gt;, order: Option&lt;String&gt;, include_totals: Option&lt;bool&gt;, fields: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, search: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;Vec&lt;Resource&gt;, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .listresources(
            &ListresourcesQueryRequest {
                page: 1,
                per_page: 1,
                sort: "sort".to_string(),
                order: "order".to_string(),
                include_totals: true,
                fields: None,
                search: None,
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

**fields:** `Option<Option<String>>` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**search:** `Option<Option<String>>` — Search query
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">getresource</a>(resource_id: String, include_metadata: Option&lt;bool&gt;, format: Option&lt;String&gt;) -> Result&lt;Resource, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .getresource(
            &"resourceId".to_string(),
            &GetresourceQueryRequest {
                include_metadata: true,
                format: "format".to_string(),
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">searchresources</a>(request: ServiceSearchResourcesRequest, limit: Option&lt;i64&gt;, offset: Option&lt;i64&gt;) -> Result&lt;SearchResponse, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .searchresources(
            &ServiceSearchResourcesRequest {
                limit: 1,
                offset: 1,
                query: None,
                filters: None,
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

**query:** `Option<Option<String>>` — Search query text
    
</dd>
</dl>

<dl>
<dd>

**filters:** `Option<Option<std::collections::HashMap<String, serde_json::Value>>>` 
    
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">listusers</a>(page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, per_page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, include_totals: Option&lt;Option&lt;Option&lt;bool&gt;&gt;&gt;, sort: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, connection: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, q: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, search_engine: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, fields: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;PaginatedUserResponse, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .listusers(
            &ListusersQueryRequest {
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

**page:** `Option<Option<i64>>` — Page index of the results to return. First page is 0.
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<Option<i64>>` — Number of results per page.
    
</dd>
</dl>

<dl>
<dd>

**include_totals:** `Option<Option<bool>>` — Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    
</dd>
</dl>

<dl>
<dd>

**sort:** `Option<Option<String>>` — Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    
</dd>
</dl>

<dl>
<dd>

**connection:** `Option<Option<String>>` — Connection filter
    
</dd>
</dl>

<dl>
<dd>

**q:** `Option<Option<String>>` — Query string following Lucene query string syntax
    
</dd>
</dl>

<dl>
<dd>

**search_engine:** `Option<Option<String>>` — Search engine version (v1, v2, or v3)
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Option<Option<String>>` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">createuser</a>(request: CreateUserRequest) -> Result&lt;User, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .createuser(
            &CreateUserRequest {
                email: "email".to_string(),
                connection: "connection".to_string(),
                email_verified: None,
                username: None,
                password: None,
                phone_number: None,
                phone_verified: None,
                user_metadata: None,
                app_metadata: None,
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

**email:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**email_verified:** `Option<Option<bool>>` 
    
</dd>
</dl>

<dl>
<dd>

**username:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**phone_number:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**phone_verified:** `Option<Option<bool>>` 
    
</dd>
</dl>

<dl>
<dd>

**user_metadata:** `Option<Option<std::collections::HashMap<String, serde_json::Value>>>` 
    
</dd>
</dl>

<dl>
<dd>

**app_metadata:** `Option<Option<std::collections::HashMap<String, serde_json::Value>>>` 
    
</dd>
</dl>

<dl>
<dd>

**connection:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">getuserbyid</a>(user_id: String, fields: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, include_fields: Option&lt;Option&lt;Option&lt;bool&gt;&gt;&gt;) -> Result&lt;User, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .getuserbyid(
            &"userId".to_string(),
            &GetuserbyidQueryRequest {
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

**fields:** `Option<Option<String>>` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>

<dl>
<dd>

**include_fields:** `Option<Option<bool>>` — true to include the fields specified, false to exclude them
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">deleteuser</a>(user_id: String) -> Result&lt;(), ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.service.deleteuser(&"userId".to_string(), None).await;
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

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">updateuser</a>(user_id: String, request: UpdateUserRequest) -> Result&lt;User, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .updateuser(
            &"userId".to_string(),
            &UpdateUserRequest {
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

**email:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**email_verified:** `Option<Option<bool>>` 
    
</dd>
</dl>

<dl>
<dd>

**username:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**phone_number:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**phone_verified:** `Option<Option<bool>>` 
    
</dd>
</dl>

<dl>
<dd>

**user_metadata:** `Option<Option<std::collections::HashMap<String, serde_json::Value>>>` 
    
</dd>
</dl>

<dl>
<dd>

**app_metadata:** `Option<Option<std::collections::HashMap<String, serde_json::Value>>>` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**blocked:** `Option<Option<bool>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">listconnections</a>(strategy: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, name: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, fields: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;Vec&lt;Connection&gt;, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .listconnections(
            &ListconnectionsQueryRequest {
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

**strategy:** `Option<Option<String>>` — Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    
</dd>
</dl>

<dl>
<dd>

**name:** `Option<Option<String>>` — Filter by connection name
    
</dd>
</dl>

<dl>
<dd>

**fields:** `Option<Option<String>>` — Comma-separated list of fields to include
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">getconnection</a>(connection_id: String, fields: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;Connection, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .getconnection(
            &"connectionId".to_string(),
            &GetconnectionQueryRequest {
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

**fields:** `Option<Option<String>>` — Comma-separated list of fields to include
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">listclients</a>(fields: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, include_fields: Option&lt;Option&lt;Option&lt;bool&gt;&gt;&gt;, page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, per_page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, include_totals: Option&lt;Option&lt;Option&lt;bool&gt;&gt;&gt;, is_global: Option&lt;Option&lt;Option&lt;bool&gt;&gt;&gt;, is_first_party: Option&lt;Option&lt;Option&lt;bool&gt;&gt;&gt;, app_type: Option&lt;Option&lt;Option&lt;Vec&lt;String&gt;&gt;&gt;&gt;) -> Result&lt;PaginatedClientResponse, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .listclients(
            &ListclientsQueryRequest {
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

**fields:** `Option<Option<String>>` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**include_fields:** `Option<Option<bool>>` — Whether specified fields are included or excluded
    
</dd>
</dl>

<dl>
<dd>

**page:** `Option<Option<i64>>` — Page number (zero-based)
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<Option<i64>>` — Number of results per page
    
</dd>
</dl>

<dl>
<dd>

**include_totals:** `Option<Option<bool>>` — Include total count in response
    
</dd>
</dl>

<dl>
<dd>

**is_global:** `Option<Option<bool>>` — Filter by global clients
    
</dd>
</dl>

<dl>
<dd>

**is_first_party:** `Option<Option<bool>>` — Filter by first party clients
    
</dd>
</dl>

<dl>
<dd>

**app_type:** `Option<Option<Vec<String>>>` — Filter by application type (spa, native, regular_web, non_interactive)
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/src/api/resources/service/client.rs">getclient</a>(client_id: String, fields: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, include_fields: Option&lt;Option&lt;Option&lt;bool&gt;&gt;&gt;) -> Result&lt;Client, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .getclient(
            &"clientId".to_string(),
            &GetclientQueryRequest {
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

**fields:** `Option<Option<String>>` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**include_fields:** `Option<Option<bool>>` — Whether specified fields are included or excluded
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

