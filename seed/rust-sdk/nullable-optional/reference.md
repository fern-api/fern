# Reference
## NullableOptional
<details><summary><code>client.nullable_optional.<a href="/src/api/resources/nullable_optional/client.rs">get_user</a>(user_id: String) -> Result<UserResponse, ApiError></code></summary>
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
use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .get_user(&"userId".to_string(), None)
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

<details><summary><code>client.nullable_optional.<a href="/src/api/resources/nullable_optional/client.rs">create_user</a>(request: CreateUserRequest) -> Result<UserResponse, ApiError></code></summary>
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
use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .create_user(
            &CreateUserRequest {
                username: "username".to_string(),
                email: Some("email".to_string()),
                phone: Some("phone".to_string()),
                address: Some(Some(Address {
                    street: "street".to_string(),
                    city: Some("city".to_string()),
                    state: Some("state".to_string()),
                    zip_code: "zipCode".to_string(),
                    country: Some(Some("country".to_string())),
                    building_id: NullableUserId(Some("buildingId".to_string())),
                    tenant_id: OptionalUserId(Some("tenantId".to_string())),
                })),
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

<details><summary><code>client.nullable_optional.<a href="/src/api/resources/nullable_optional/client.rs">update_user</a>(user_id: String, request: UpdateUserRequest) -> Result<UserResponse, ApiError></code></summary>
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
use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .update_user(
            &"userId".to_string(),
            &UpdateUserRequest {
                username: Some("username".to_string()),
                email: Some(Some("email".to_string())),
                phone: Some("phone".to_string()),
                address: Some(Some(Address {
                    street: "street".to_string(),
                    city: Some("city".to_string()),
                    state: Some("state".to_string()),
                    zip_code: "zipCode".to_string(),
                    country: Some(Some("country".to_string())),
                    building_id: NullableUserId(Some("buildingId".to_string())),
                    tenant_id: OptionalUserId(Some("tenantId".to_string())),
                })),
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

<details><summary><code>client.nullable_optional.<a href="/src/api/resources/nullable_optional/client.rs">list_users</a>(limit: Option<Option<i64>>, offset: Option<Option<i64>>, include_deleted: Option<Option<bool>>, sort_by: Option<Option<Option<String>>>) -> Result<Vec<UserResponse>, ApiError></code></summary>
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
use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .list_users(
            &ListUsersQueryRequest {
                limit: Some(1),
                offset: Some(1),
                include_deleted: Some(true),
                sort_by: Some(Some("sortBy".to_string())),
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

**limit:** `Option<i64>` 
    
</dd>
</dl>

<dl>
<dd>

**offset:** `Option<i64>` 
    
</dd>
</dl>

<dl>
<dd>

**include_deleted:** `Option<bool>` 
    
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

<details><summary><code>client.nullable_optional.<a href="/src/api/resources/nullable_optional/client.rs">search_users</a>(query: Option<String>, department: Option<Option<String>>, role: Option<Option<String>>, is_active: Option<Option<Option<bool>>>) -> Result<Vec<UserResponse>, ApiError></code></summary>
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
use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .search_users(
            &SearchUsersQueryRequest {
                query: "query".to_string(),
                department: Some("department".to_string()),
                role: Some("role".to_string()),
                is_active: Some(Some(true)),
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

**role:** `Option<String>` 
    
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

<details><summary><code>client.nullable_optional.<a href="/src/api/resources/nullable_optional/client.rs">create_complex_profile</a>(request: ComplexProfile) -> Result<ComplexProfile, ApiError></code></summary>
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
use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .create_complex_profile(
            &ComplexProfile {
                id: "id".to_string(),
                nullable_role: Some(UserRole::Admin),
                optional_role: Some(UserRole::Admin),
                optional_nullable_role: Some(Some(UserRole::Admin)),
                nullable_status: Some(UserStatus::Active),
                optional_status: Some(UserStatus::Active),
                optional_nullable_status: Some(Some(UserStatus::Active)),
                nullable_notification: Some(NotificationMethod::Email {
                    data: EmailNotification {
                        email_address: "emailAddress".to_string(),
                        subject: "subject".to_string(),
                        html_content: Some("htmlContent".to_string()),
                    },
                }),
                optional_notification: Some(NotificationMethod::Email {
                    data: EmailNotification {
                        email_address: "emailAddress".to_string(),
                        subject: "subject".to_string(),
                        html_content: Some("htmlContent".to_string()),
                    },
                }),
                optional_nullable_notification: Some(Some(NotificationMethod::Email {
                    data: EmailNotification {
                        email_address: "emailAddress".to_string(),
                        subject: "subject".to_string(),
                        html_content: Some("htmlContent".to_string()),
                    },
                })),
                nullable_search_result: Some(SearchResult::User {
                    data: UserResponse {
                        id: "id".to_string(),
                        username: "username".to_string(),
                        email: Some("email".to_string()),
                        phone: Some("phone".to_string()),
                        created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                            .unwrap()
                            .with_timezone(&Utc),
                        updated_at: Some(
                            DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                                .unwrap()
                                .with_timezone(&Utc),
                        ),
                        address: Some(Address {
                            street: "street".to_string(),
                            city: Some("city".to_string()),
                            state: Some("state".to_string()),
                            zip_code: "zipCode".to_string(),
                            country: Some(Some("country".to_string())),
                            building_id: NullableUserId(Some("buildingId".to_string())),
                            tenant_id: OptionalUserId(Some("tenantId".to_string())),
                        }),
                    },
                }),
                optional_search_result: Some(SearchResult::User {
                    data: UserResponse {
                        id: "id".to_string(),
                        username: "username".to_string(),
                        email: Some("email".to_string()),
                        phone: Some("phone".to_string()),
                        created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                            .unwrap()
                            .with_timezone(&Utc),
                        updated_at: Some(
                            DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                                .unwrap()
                                .with_timezone(&Utc),
                        ),
                        address: Some(Address {
                            street: "street".to_string(),
                            city: Some("city".to_string()),
                            state: Some("state".to_string()),
                            zip_code: "zipCode".to_string(),
                            country: Some(Some("country".to_string())),
                            building_id: NullableUserId(Some("buildingId".to_string())),
                            tenant_id: OptionalUserId(Some("tenantId".to_string())),
                        }),
                    },
                }),
                nullable_array: Some(vec![
                    "nullableArray".to_string(),
                    "nullableArray".to_string(),
                ]),
                optional_array: Some(vec![
                    "optionalArray".to_string(),
                    "optionalArray".to_string(),
                ]),
                optional_nullable_array: Some(Some(vec![
                    "optionalNullableArray".to_string(),
                    "optionalNullableArray".to_string(),
                ])),
                nullable_list_of_nullables: Some(vec![
                    Some("nullableListOfNullables".to_string()),
                    Some("nullableListOfNullables".to_string()),
                ]),
                nullable_map_of_nullables: Some(HashMap::from([(
                    "nullableMapOfNullables".to_string(),
                    Some(Address {
                        street: "street".to_string(),
                        city: Some("city".to_string()),
                        state: Some("state".to_string()),
                        zip_code: "zipCode".to_string(),
                        country: Some(Some("country".to_string())),
                        building_id: NullableUserId(Some("buildingId".to_string())),
                        tenant_id: OptionalUserId(Some("tenantId".to_string())),
                    }),
                )])),
                nullable_list_of_unions: Some(vec![
                    NotificationMethod::Email {
                        data: EmailNotification {
                            email_address: "emailAddress".to_string(),
                            subject: "subject".to_string(),
                            html_content: Some("htmlContent".to_string()),
                        },
                    },
                    NotificationMethod::Email {
                        data: EmailNotification {
                            email_address: "emailAddress".to_string(),
                            subject: "subject".to_string(),
                            html_content: Some("htmlContent".to_string()),
                        },
                    },
                ]),
                optional_map_of_enums: Some(HashMap::from([(
                    "optionalMapOfEnums".to_string(),
                    UserRole::Admin,
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


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.<a href="/src/api/resources/nullable_optional/client.rs">get_complex_profile</a>(profile_id: String) -> Result<ComplexProfile, ApiError></code></summary>
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
use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .get_complex_profile(&"profileId".to_string(), None)
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

<details><summary><code>client.nullable_optional.<a href="/src/api/resources/nullable_optional/client.rs">update_complex_profile</a>(profile_id: String, request: UpdateComplexProfileRequest) -> Result<ComplexProfile, ApiError></code></summary>
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
use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .update_complex_profile(
            &"profileId".to_string(),
            &UpdateComplexProfileRequest {
                nullable_role: Some(Some(UserRole::Admin)),
                nullable_status: Some(Some(UserStatus::Active)),
                nullable_notification: Some(Some(NotificationMethod::Email {
                    data: EmailNotification {
                        email_address: "emailAddress".to_string(),
                        subject: "subject".to_string(),
                        html_content: Some("htmlContent".to_string()),
                    },
                })),
                nullable_search_result: Some(Some(SearchResult::User {
                    data: UserResponse {
                        id: "id".to_string(),
                        username: "username".to_string(),
                        email: Some("email".to_string()),
                        phone: Some("phone".to_string()),
                        created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                            .unwrap()
                            .with_timezone(&Utc),
                        updated_at: Some(
                            DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                                .unwrap()
                                .with_timezone(&Utc),
                        ),
                        address: Some(Address {
                            street: "street".to_string(),
                            city: Some("city".to_string()),
                            state: Some("state".to_string()),
                            zip_code: "zipCode".to_string(),
                            country: Some(Some("country".to_string())),
                            building_id: NullableUserId(Some("buildingId".to_string())),
                            tenant_id: OptionalUserId(Some("tenantId".to_string())),
                        }),
                    },
                })),
                nullable_array: Some(Some(vec![
                    "nullableArray".to_string(),
                    "nullableArray".to_string(),
                ])),
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

**nullable_role:** `Option<Option<UserRole>>` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_status:** `Option<Option<UserStatus>>` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_notification:** `Option<Option<NotificationMethod>>` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_search_result:** `Option<Option<SearchResult>>` 
    
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

<details><summary><code>client.nullable_optional.<a href="/src/api/resources/nullable_optional/client.rs">test_deserialization</a>(request: DeserializationTestRequest) -> Result<DeserializationTestResponse, ApiError></code></summary>
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
use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .test_deserialization(
            &DeserializationTestRequest {
                required_string: "requiredString".to_string(),
                nullable_string: Some("nullableString".to_string()),
                optional_string: Some("optionalString".to_string()),
                optional_nullable_string: Some(Some("optionalNullableString".to_string())),
                nullable_enum: Some(UserRole::Admin),
                optional_enum: Some(UserStatus::Active),
                nullable_union: Some(NotificationMethod::Email {
                    data: EmailNotification {
                        email_address: "emailAddress".to_string(),
                        subject: "subject".to_string(),
                        html_content: Some("htmlContent".to_string()),
                    },
                }),
                optional_union: Some(SearchResult::User {
                    data: UserResponse {
                        id: "id".to_string(),
                        username: "username".to_string(),
                        email: Some("email".to_string()),
                        phone: Some("phone".to_string()),
                        created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                            .unwrap()
                            .with_timezone(&Utc),
                        updated_at: Some(
                            DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                                .unwrap()
                                .with_timezone(&Utc),
                        ),
                        address: Some(Address {
                            street: "street".to_string(),
                            city: Some("city".to_string()),
                            state: Some("state".to_string()),
                            zip_code: "zipCode".to_string(),
                            country: Some(Some("country".to_string())),
                            building_id: NullableUserId(Some("buildingId".to_string())),
                            tenant_id: OptionalUserId(Some("tenantId".to_string())),
                        }),
                    },
                }),
                nullable_list: Some(vec!["nullableList".to_string(), "nullableList".to_string()]),
                nullable_map: Some(HashMap::from([("nullableMap".to_string(), 1)])),
                nullable_object: Some(Address {
                    street: "street".to_string(),
                    city: Some("city".to_string()),
                    state: Some("state".to_string()),
                    zip_code: "zipCode".to_string(),
                    country: Some(Some("country".to_string())),
                    building_id: NullableUserId(Some("buildingId".to_string())),
                    tenant_id: OptionalUserId(Some("tenantId".to_string())),
                }),
                optional_object: Some(Organization {
                    id: "id".to_string(),
                    name: "name".to_string(),
                    domain: Some("domain".to_string()),
                    employee_count: Some(1),
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


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.<a href="/src/api/resources/nullable_optional/client.rs">filter_by_role</a>(role: Option<Option<UserRole>>, status: Option<Option<UserStatus>>, secondary_role: Option<Option<Option<UserRole>>>) -> Result<Vec<UserResponse>, ApiError></code></summary>
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
use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .filter_by_role(
            &FilterByRoleQueryRequest {
                role: Some(UserRole::Admin),
                status: Some(UserStatus::Active),
                secondary_role: Some(Some(UserRole::Admin)),
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

**role:** `Option<UserRole>` 
    
</dd>
</dl>

<dl>
<dd>

**status:** `Option<UserStatus>` 
    
</dd>
</dl>

<dl>
<dd>

**secondary_role:** `Option<Option<UserRole>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable_optional.<a href="/src/api/resources/nullable_optional/client.rs">get_notification_settings</a>(user_id: String) -> Result<Option<NotificationMethod>, ApiError></code></summary>
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
use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .get_notification_settings(&"userId".to_string(), None)
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

<details><summary><code>client.nullable_optional.<a href="/src/api/resources/nullable_optional/client.rs">update_tags</a>(user_id: String, request: UpdateTagsRequest) -> Result<Vec<String>, ApiError></code></summary>
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
use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .update_tags(
            &"userId".to_string(),
            &UpdateTagsRequest {
                tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                categories: Some(vec!["categories".to_string(), "categories".to_string()]),
                labels: Some(Some(vec!["labels".to_string(), "labels".to_string()])),
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

**categories:** `Option<Vec<String>>` 
    
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

<details><summary><code>client.nullable_optional.<a href="/src/api/resources/nullable_optional/client.rs">get_search_results</a>(request: SearchRequest) -> Result<Option<Vec<SearchResult>>, ApiError></code></summary>
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
use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .get_search_results(
            &SearchRequest {
                query: "query".to_string(),
                filters: Some(HashMap::from([(
                    "filters".to_string(),
                    Some("filters".to_string()),
                )])),
                include_types: Some(vec!["includeTypes".to_string(), "includeTypes".to_string()]),
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

**filters:** `Option<std::collections::HashMap<String, Option<String>>>` 
    
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
