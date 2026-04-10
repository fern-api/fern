# Reference
## Nullableoptional
<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client.rs">getuser</a>(user_id: String) -> Result&lt;UserResponse, ApiError&gt;</code></summary>
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
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .nullableoptional
        .getuser(&"userId".to_string(), None)
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

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client.rs">updateuser</a>(user_id: String, request: UpdateUserRequest) -> Result&lt;UserResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a user (partial update)
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
        .nullableoptional
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

**username:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**phone:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**address:** `Option<Address>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client.rs">listusers</a>(limit: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, offset: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, include_deleted: Option&lt;Option&lt;Option&lt;bool&gt;&gt;&gt;, sort_by: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;Vec&lt;UserResponse&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all users
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
        .nullableoptional
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

**limit:** `Option<Option<i64>>` 
    
</dd>
</dl>

<dl>
<dd>

**offset:** `Option<Option<i64>>` 
    
</dd>
</dl>

<dl>
<dd>

**include_deleted:** `Option<Option<bool>>` 
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `Option<Option<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client.rs">createuser</a>(request: CreateUserRequest) -> Result&lt;UserResponse, ApiError&gt;</code></summary>
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
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .nullableoptional
        .createuser(
            &CreateUserRequest {
                username: "username".to_string(),
                email: None,
                phone: None,
                address: None,
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

**email:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**phone:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**address:** `Option<Address>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client.rs">searchusers</a>(query: Option&lt;String&gt;, department: Option&lt;Option&lt;String&gt;&gt;, role: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;, is_active: Option&lt;Option&lt;Option&lt;bool&gt;&gt;&gt;) -> Result&lt;Vec&lt;UserResponse&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search users
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
        .nullableoptional
        .searchusers(
            &SearchusersQueryRequest {
                query: "query".to_string(),
                department: Some("department".to_string()),
                role: None,
                is_active: None,
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

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**department:** `Option<String>` 
    
</dd>
</dl>

<dl>
<dd>

**role:** `Option<Option<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**is_active:** `Option<Option<bool>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client.rs">createcomplexprofile</a>(request: ComplexProfile) -> Result&lt;ComplexProfile, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a complex profile to test nullable enums and unions
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
        .nullableoptional
        .createcomplexprofile(
            &ComplexProfile {
                id: "id".to_string(),
                nullable_role: UserRole::Admin,
                optional_role: None,
                optional_nullable_role: None,
                nullable_status: UserStatus::Active,
                optional_status: None,
                optional_nullable_status: None,
                nullable_notification: NotificationMethod::NotificationMethodZero(
                    NotificationMethodZero {
                        email_notification_fields: EmailNotification {
                            email_address: "emailAddress".to_string(),
                            subject: "subject".to_string(),
                            ..Default::default()
                        },
                        r#type: NotificationMethodZeroType::Email,
                    },
                ),
                optional_notification: None,
                optional_nullable_notification: None,
                nullable_search_result: SearchResult::SearchResultZero(SearchResultZero {
                    user_response_fields: UserResponse {
                        id: "id".to_string(),
                        username: "username".to_string(),
                        created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                        ..Default::default()
                    },
                    r#type: SearchResultZeroType::User,
                }),
                optional_search_result: None,
                nullable_array: None,
                optional_array: None,
                optional_nullable_array: None,
                nullable_list_of_nullables: None,
                nullable_map_of_nullables: None,
                nullable_list_of_unions: None,
                optional_map_of_enums: None,
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

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client.rs">getcomplexprofile</a>(profile_id: String) -> Result&lt;ComplexProfile, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a complex profile by ID
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
        .nullableoptional
        .getcomplexprofile(&"profileId".to_string(), None)
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

**profile_id:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client.rs">updatecomplexprofile</a>(profile_id: String, request: NullableOptionalUpdateComplexProfileRequest) -> Result&lt;ComplexProfile, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update complex profile to test nullable field updates
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
        .nullableoptional
        .updatecomplexprofile(
            &"profileId".to_string(),
            &NullableOptionalUpdateComplexProfileRequest {
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

**profile_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_role:** `Option<UserRole>` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_status:** `Option<UserStatus>` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_notification:** `Option<NotificationMethod>` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_search_result:** `Option<SearchResult>` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_array:** `Option<Option<Vec<String>>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client.rs">testdeserialization</a>(request: DeserializationTestRequest) -> Result&lt;DeserializationTestResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint for validating null deserialization
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
        .nullableoptional
        .testdeserialization(
            &DeserializationTestRequest {
                required_string: "requiredString".to_string(),
                nullable_string: None,
                optional_string: None,
                optional_nullable_string: None,
                nullable_enum: UserRole::Admin,
                optional_enum: None,
                nullable_union: NotificationMethod::NotificationMethodZero(
                    NotificationMethodZero {
                        email_notification_fields: EmailNotification {
                            email_address: "emailAddress".to_string(),
                            subject: "subject".to_string(),
                            ..Default::default()
                        },
                        r#type: NotificationMethodZeroType::Email,
                    },
                ),
                optional_union: None,
                nullable_list: None,
                nullable_map: None,
                nullable_object: Address {
                    street: "street".to_string(),
                    zip_code: "zipCode".to_string(),
                    ..Default::default()
                },
                optional_object: None,
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

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client.rs">filterbyrole</a>(role: Option&lt;UserRole&gt;, status: Option&lt;Option&lt;UserStatus&gt;&gt;, secondary_role: Option&lt;Option&lt;UserRole&gt;&gt;) -> Result&lt;Vec&lt;UserResponse&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Filter users by role with nullable enum
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
        .nullableoptional
        .filterbyrole(
            &FilterbyroleQueryRequest {
                role: UserRole::Admin,
                status: None,
                secondary_role: None,
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

**role:** `UserRole` 
    
</dd>
</dl>

<dl>
<dd>

**status:** `Option<UserStatus>` 
    
</dd>
</dl>

<dl>
<dd>

**secondary_role:** `Option<UserRole>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client.rs">getnotificationsettings</a>(user_id: String) -> Result&lt;NotificationMethod, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get notification settings which may be null
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
        .nullableoptional
        .getnotificationsettings(&"userId".to_string(), None)
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

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client.rs">updatetags</a>(user_id: String, request: NullableOptionalUpdateTagsRequest) -> Result&lt;Vec&lt;String&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update tags to test array handling
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
        .nullableoptional
        .updatetags(
            &"userId".to_string(),
            &NullableOptionalUpdateTagsRequest {
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

**tags:** `Option<Vec<String>>` 
    
</dd>
</dl>

<dl>
<dd>

**categories:** `Option<Option<Vec<String>>>` 
    
</dd>
</dl>

<dl>
<dd>

**labels:** `Option<Option<Vec<String>>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullableoptional.<a href="/src/api/resources/nullableoptional/client.rs">getsearchresults</a>(request: NullableOptionalGetSearchResultsRequest) -> Result&lt;Option&lt;Vec&lt;SearchResult&gt;&gt;, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get search results with nullable unions
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
        .nullableoptional
        .getsearchresults(
            &NullableOptionalGetSearchResultsRequest {
                query: "query".to_string(),
                filters: None,
                include_types: None,
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

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**filters:** `Option<Option<std::collections::HashMap<String, Option<String>>>>` 
    
</dd>
</dl>

<dl>
<dd>

**include_types:** `Option<Vec<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

