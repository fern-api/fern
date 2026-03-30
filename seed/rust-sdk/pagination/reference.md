# Reference
## Conversations
<details><summary><code>client.complex.<a href="/src/api/resources/complex/client.rs">search</a>(index: String, request: SearchRequest) -> Result&lt;PaginatedConversationResponse, ApiError&gt;</code></summary>
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
                    ..Default::default()
                }),
                query: SearchRequestQuery::SingleFilterSearchRequest(SingleFilterSearchRequest {
                    field: Some("field".to_string()),
                    operator: Some(SingleFilterSearchRequestOperator::Equals),
                    value: Some("value".to_string()),
                    ..Default::default()
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
<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_cursor_pagination</a>(page: Option&lt;Option&lt;i64&gt;&gt;, per_page: Option&lt;Option&lt;i64&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;, starting_after: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &InlineUsersInlineUsersListWithCursorPaginationQueryRequest {
                page: Some(1),
                per_page: Some(1),
                order: Some(Order::Asc),
                starting_after: Some("starting_after".to_string()),
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

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_mixed_type_cursor_pagination</a>(cursor: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;ListUsersMixedTypePaginationResponse, ApiError&gt;</code></summary>
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
            &InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest {
                cursor: Some("cursor".to_string()),
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

**cursor:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_body_cursor_pagination</a>(request: ListUsersBodyCursorPaginationRequest) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest {
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

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_offset_pagination</a>(page: Option&lt;Option&lt;i64&gt;&gt;, per_page: Option&lt;Option&lt;i64&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;, starting_after: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &InlineUsersInlineUsersListWithCursorPaginationQueryRequest {
                page: Some(1),
                per_page: Some(1),
                order: Some(Order::Asc),
                starting_after: Some("starting_after".to_string()),
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

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_double_offset_pagination</a>(page: Option&lt;Option&lt;f64&gt;&gt;, per_page: Option&lt;Option&lt;f64&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;, starting_after: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequest {
                page: Some(1.1),
                per_page: Some(1.1),
                order: Some(Order::Asc),
                starting_after: Some("starting_after".to_string()),
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

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_body_offset_pagination</a>(request: ListUsersBodyOffsetPaginationRequest) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &InlineUsersInlineUsersListWithMixedTypeCursorPaginationQueryRequest {
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

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_offset_step_pagination</a>(page: Option&lt;Option&lt;i64&gt;&gt;, limit: Option&lt;Option&lt;i64&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &InlineUsersInlineUsersListWithOffsetStepPaginationQueryRequest {
                page: Some(1),
                limit: Some(1),
                order: Some(Order::Asc),
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

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_offset_pagination_has_next_page</a>(page: Option&lt;Option&lt;i64&gt;&gt;, limit: Option&lt;Option&lt;i64&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &InlineUsersInlineUsersListWithOffsetStepPaginationQueryRequest {
                page: Some(1),
                limit: Some(1),
                order: Some(Order::Asc),
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

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_extended_results</a>(cursor: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;ListUsersExtendedResponse, ApiError&gt;</code></summary>
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
            &InlineUsersInlineUsersListWithExtendedResultsQueryRequest {
                cursor: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
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

**cursor:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_extended_results_and_optional_data</a>(cursor: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;ListUsersExtendedOptionalListResponse, ApiError&gt;</code></summary>
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
            &InlineUsersInlineUsersListWithExtendedResultsQueryRequest {
                cursor: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
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

**cursor:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_usernames</a>(starting_after: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;UsernameCursor, ApiError&gt;</code></summary>
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
            &InlineUsersInlineUsersListWithCursorPaginationQueryRequest {
                starting_after: Some("starting_after".to_string()),
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

<details><summary><code>client.inline_users().inline_users.<a href="/src/api/resources/inline_users/inline_users/client.rs">list_with_global_config</a>(offset: Option&lt;Option&lt;i64&gt;&gt;) -> Result&lt;UsernameContainer, ApiError&gt;</code></summary>
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
        .list_with_global_config(
            &InlineUsersInlineUsersListWithGlobalConfigQueryRequest {
                offset: Some(1),
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

**offset:** `Option<i64>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_cursor_pagination</a>(page: Option&lt;Option&lt;i64&gt;&gt;, per_page: Option&lt;Option&lt;i64&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;, starting_after: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &UsersListWithCursorPaginationQueryRequest {
                page: Some(1),
                per_page: Some(1),
                order: Some(Order::Asc),
                starting_after: Some("starting_after".to_string()),
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_mixed_type_cursor_pagination</a>(cursor: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;ListUsersMixedTypePaginationResponse, ApiError&gt;</code></summary>
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
            &UsersListWithMixedTypeCursorPaginationQueryRequest {
                cursor: Some("cursor".to_string()),
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

**cursor:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_body_cursor_pagination</a>(request: ListUsersBodyCursorPaginationRequest) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &UsersListWithMixedTypeCursorPaginationQueryRequest {
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_top_level_body_cursor_pagination</a>(request: ListUsersTopLevelBodyCursorPaginationRequest) -> Result&lt;ListUsersTopLevelCursorPaginationResponse, ApiError&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Pagination endpoint with a top-level cursor field in the request body.
This tests that the mock server correctly ignores cursor mismatches
when getNextPage() is called with a different cursor value.
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
        .list_with_top_level_body_cursor_pagination(
            &ListUsersTopLevelBodyCursorPaginationRequest {
                cursor: Some("initial_cursor".to_string()),
                filter: Some("active".to_string()),
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

**cursor:** `Option<String>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**filter:** `Option<String>` — An optional filter to apply to the results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_offset_pagination</a>(page: Option&lt;Option&lt;i64&gt;&gt;, per_page: Option&lt;Option&lt;i64&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;, starting_after: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &UsersListWithCursorPaginationQueryRequest {
                page: Some(1),
                per_page: Some(1),
                order: Some(Order::Asc),
                starting_after: Some("starting_after".to_string()),
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_double_offset_pagination</a>(page: Option&lt;Option&lt;f64&gt;&gt;, per_page: Option&lt;Option&lt;f64&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;, starting_after: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &UsersListWithDoubleOffsetPaginationQueryRequest {
                page: Some(1.1),
                per_page: Some(1.1),
                order: Some(Order::Asc),
                starting_after: Some("starting_after".to_string()),
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_body_offset_pagination</a>(request: ListUsersBodyOffsetPaginationRequest) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &UsersListWithMixedTypeCursorPaginationQueryRequest {
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_offset_step_pagination</a>(page: Option&lt;Option&lt;i64&gt;&gt;, limit: Option&lt;Option&lt;i64&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &UsersListWithOffsetStepPaginationQueryRequest {
                page: Some(1),
                limit: Some(1),
                order: Some(Order::Asc),
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_offset_pagination_has_next_page</a>(page: Option&lt;Option&lt;i64&gt;&gt;, limit: Option&lt;Option&lt;i64&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
            &UsersListWithOffsetStepPaginationQueryRequest {
                page: Some(1),
                limit: Some(1),
                order: Some(Order::Asc),
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_extended_results</a>(cursor: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;ListUsersExtendedResponse, ApiError&gt;</code></summary>
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
            &UsersListWithExtendedResultsQueryRequest {
                cursor: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
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

**cursor:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_extended_results_and_optional_data</a>(cursor: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;ListUsersExtendedOptionalListResponse, ApiError&gt;</code></summary>
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
            &UsersListWithExtendedResultsQueryRequest {
                cursor: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
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

**cursor:** `Option<String>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_usernames</a>(starting_after: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;UsernameCursor, ApiError&gt;</code></summary>
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
            &UsersListWithCursorPaginationQueryRequest {
                starting_after: Some("starting_after".to_string()),
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_usernames_with_optional_response</a>(starting_after: Option&lt;Option&lt;String&gt;&gt;) -> Result&lt;Option&lt;UsernameCursor&gt;, ApiError&gt;</code></summary>
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
            &UsersListWithCursorPaginationQueryRequest {
                starting_after: Some("starting_after".to_string()),
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_global_config</a>(offset: Option&lt;Option&lt;i64&gt;&gt;) -> Result&lt;UsernameContainer, ApiError&gt;</code></summary>
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
        .list_with_global_config(
            &UsersListWithGlobalConfigQueryRequest {
                offset: Some(1),
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

**offset:** `Option<i64>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">list_with_optional_data</a>(page: Option&lt;Option&lt;i64&gt;&gt;) -> Result&lt;ListUsersOptionalDataPaginationResponse, ApiError&gt;</code></summary>
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
        .list_with_optional_data(
            &ListWithOptionalDataQueryRequest {
                page: Some(1),
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

**page:** `Option<i64>` — Defaults to first page
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

