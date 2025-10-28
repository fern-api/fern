# Reference
## Conversations
<details><summary><code>client.complex.<a href="/src/api/resources/complex/client.rs">search</a>(index: String, request: SearchRequest) -> Result<PaginatedConversationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .complex
        .search(
            &"index".to_string(),
            &SearchRequest {
                pagination: Some(StartingAfterPaging {
                    per_page: 1,
                    starting_after: Some("starting_after".to_string()),
                }),
                query: SearchRequestQuery::SingleFilterSearchRequest(SingleFilterSearchRequest {
                    field: Some("field".to_string()),
                    operator: Some(SingleFilterSearchRequestOperator::Equals),
                    value: Some("value".to_string()),
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

**index:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlineUsers InlineUsers
<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_cursor_pagination</a>(page: Option<Option<i64>>, per_page: Option<Option<i64>>, order: Option<Option<Order>>, starting_after: Option<Option<String>>) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users
        .inline_users
        .list_with_cursor_pagination(
            &ListWithCursorPaginationQueryRequest {
                page: Some(1),
                per_page: Some(1),
                order: Some(Order::Asc),
                starting_after: Some("starting_after".to_string()),
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

**page:** `Option<i64>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<i64>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<Order>` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_mixed_type_cursor_pagination</a>(cursor: Option<Option<String>>) -> Result<ListUsersMixedTypePaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users
        .inline_users
        .list_with_mixed_type_cursor_pagination(
            &ListWithMixedTypeCursorPaginationQueryRequest {
                cursor: Some("cursor".to_string()),
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

**cursor:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_body_cursor_pagination</a>(request: ListUsersBodyCursorPaginationRequest) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users
        .inline_users
        .list_with_mixed_type_cursor_pagination(
            &ListWithMixedTypeCursorPaginationQueryRequest {},
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

**pagination:** `Option<WithCursor>` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_offset_pagination</a>(page: Option<Option<i64>>, per_page: Option<Option<i64>>, order: Option<Option<Order>>, starting_after: Option<Option<String>>) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users
        .inline_users
        .list_with_cursor_pagination(
            &ListWithCursorPaginationQueryRequest {
                page: Some(1),
                per_page: Some(1),
                order: Some(Order::Asc),
                starting_after: Some("starting_after".to_string()),
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

**page:** `Option<i64>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<i64>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<Order>` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_double_offset_pagination</a>(page: Option<Option<f64>>, per_page: Option<Option<f64>>, order: Option<Option<Order>>, starting_after: Option<Option<String>>) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users
        .inline_users
        .list_with_double_offset_pagination(
            &ListWithDoubleOffsetPaginationQueryRequest {
                page: Some(1.1),
                per_page: Some(1.1),
                order: Some(Order::Asc),
                starting_after: Some("starting_after".to_string()),
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

**page:** `Option<f64>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<f64>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<Order>` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_body_offset_pagination</a>(request: ListUsersBodyOffsetPaginationRequest) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users
        .inline_users
        .list_with_mixed_type_cursor_pagination(
            &ListWithMixedTypeCursorPaginationQueryRequest {},
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

**pagination:** `Option<WithPage>` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_offset_step_pagination</a>(page: Option<Option<i64>>, limit: Option<Option<i64>>, order: Option<Option<Order>>) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users
        .inline_users
        .list_with_offset_step_pagination(
            &ListWithOffsetStepPaginationQueryRequest {
                page: Some(1),
                limit: Some(1),
                order: Some(Order::Asc),
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

**page:** `Option<i64>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<i64>` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<Order>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_offset_pagination_has_next_page</a>(page: Option<Option<i64>>, limit: Option<Option<i64>>, order: Option<Option<Order>>) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users
        .inline_users
        .list_with_offset_step_pagination(
            &ListWithOffsetStepPaginationQueryRequest {
                page: Some(1),
                limit: Some(1),
                order: Some(Order::Asc),
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

**page:** `Option<i64>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<i64>` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<Order>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_extended_results</a>(cursor: Option<Option<String>>) -> Result<ListUsersExtendedResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users
        .inline_users
        .list_with_extended_results(
            &ListWithExtendedResultsQueryRequest {
                cursor: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
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

**cursor:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_extended_results_and_optional_data</a>(cursor: Option<Option<String>>) -> Result<ListUsersExtendedOptionalListResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users
        .inline_users
        .list_with_extended_results(
            &ListWithExtendedResultsQueryRequest {
                cursor: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
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

**cursor:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_usernames</a>(starting_after: Option<Option<String>>) -> Result<UsernameCursor, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users
        .inline_users
        .list_with_cursor_pagination(
            &ListWithCursorPaginationQueryRequest {
                starting_after: Some("starting_after".to_string()),
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

**starting_after:** `Option<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_global_config</a>(offset: Option<Option<i64>>) -> Result<UsernameContainer, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users
        .inline_users
        .list_with_global_config(&ListWithGlobalConfigQueryRequest { offset: Some(1) }, None)
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

**offset:** `Option<i64>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_cursor_pagination</a>(page: Option<Option<i64>>, per_page: Option<Option<i64>>, order: Option<Option<Order>>, starting_after: Option<Option<String>>) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_with_cursor_pagination(
            &ListWithCursorPaginationQueryRequest {
                page: Some(1),
                per_page: Some(1),
                order: Some(Order::Asc),
                starting_after: Some("starting_after".to_string()),
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

**page:** `Option<i64>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<i64>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<Order>` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_mixed_type_cursor_pagination</a>(cursor: Option<Option<String>>) -> Result<ListUsersMixedTypePaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_with_mixed_type_cursor_pagination(
            &ListWithMixedTypeCursorPaginationQueryRequest {
                cursor: Some("cursor".to_string()),
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

**cursor:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_body_cursor_pagination</a>(request: ListUsersBodyCursorPaginationRequest) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_with_mixed_type_cursor_pagination(
            &ListWithMixedTypeCursorPaginationQueryRequest {},
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

**pagination:** `Option<WithCursor>` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_offset_pagination</a>(page: Option<Option<i64>>, per_page: Option<Option<i64>>, order: Option<Option<Order>>, starting_after: Option<Option<String>>) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_with_cursor_pagination(
            &ListWithCursorPaginationQueryRequest {
                page: Some(1),
                per_page: Some(1),
                order: Some(Order::Asc),
                starting_after: Some("starting_after".to_string()),
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

**page:** `Option<i64>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<i64>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<Order>` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_double_offset_pagination</a>(page: Option<Option<f64>>, per_page: Option<Option<f64>>, order: Option<Option<Order>>, starting_after: Option<Option<String>>) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_with_double_offset_pagination(
            &ListWithDoubleOffsetPaginationQueryRequest {
                page: Some(1.1),
                per_page: Some(1.1),
                order: Some(Order::Asc),
                starting_after: Some("starting_after".to_string()),
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

**page:** `Option<f64>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<f64>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<Order>` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_body_offset_pagination</a>(request: ListUsersBodyOffsetPaginationRequest) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_with_mixed_type_cursor_pagination(
            &ListWithMixedTypeCursorPaginationQueryRequest {},
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

**pagination:** `Option<WithPage>` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_offset_step_pagination</a>(page: Option<Option<i64>>, limit: Option<Option<i64>>, order: Option<Option<Order>>) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_with_offset_step_pagination(
            &ListWithOffsetStepPaginationQueryRequest {
                page: Some(1),
                limit: Some(1),
                order: Some(Order::Asc),
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

**page:** `Option<i64>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<i64>` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<Order>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_offset_pagination_has_next_page</a>(page: Option<Option<i64>>, limit: Option<Option<i64>>, order: Option<Option<Order>>) -> Result<ListUsersPaginationResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_with_offset_step_pagination(
            &ListWithOffsetStepPaginationQueryRequest {
                page: Some(1),
                limit: Some(1),
                order: Some(Order::Asc),
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

**page:** `Option<i64>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<i64>` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<Order>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_extended_results</a>(cursor: Option<Option<String>>) -> Result<ListUsersExtendedResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_with_extended_results(
            &ListWithExtendedResultsQueryRequest {
                cursor: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
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

**cursor:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_extended_results_and_optional_data</a>(cursor: Option<Option<String>>) -> Result<ListUsersExtendedOptionalListResponse, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_with_extended_results(
            &ListWithExtendedResultsQueryRequest {
                cursor: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
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

**cursor:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_usernames</a>(starting_after: Option<Option<String>>) -> Result<UsernameCursor, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_with_cursor_pagination(
            &ListWithCursorPaginationQueryRequest {
                starting_after: Some("starting_after".to_string()),
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

**starting_after:** `Option<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_global_config</a>(offset: Option<Option<i64>>) -> Result<UsernameContainer, ApiError></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```rust
use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users
        .list_with_global_config(&ListWithGlobalConfigQueryRequest { offset: Some(1) }, None)
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

**offset:** `Option<i64>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
