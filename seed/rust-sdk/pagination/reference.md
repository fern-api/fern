# Reference
## Complex
<details><summary><code>client.complex.<a href="/src/api/resources/complex/client.rs">search</a>(index: String, request: SearchRequest) -> Result&lt;PaginatedConversationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .complex
        .search(
            &"index".to_string(),
            &SearchRequest {
                query: SearchRequestQuery::SingleFilterSearchRequest(SingleFilterSearchRequest {
                    ..Default::default()
                }),
                pagination: None,
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

<dl>
<dd>

**pagination:** `Option<StartingAfterPaging>` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `SearchRequestQuery` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlineUsersInlineUsers
<details><summary><code>client.inline_users_inline_users.<a href="/src/api/resources/inline_users_inline_users/client.rs">inline_users_inline_users_list_with_cursor_pagination</a>(page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, per_page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, order: Option&lt;Option&lt;InlineUsersOrder&gt;&gt;, starting_after: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;InlineUsersListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inline_users_inline_users
        .inline_users_inline_users_list_with_cursor_pagination(
            &InlineUsersInlineUsersListWithCursorPaginationQueryRequest {
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

**page:** `Option<Option<i64>>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<Option<i64>>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<InlineUsersOrder>` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<Option<String>>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/src/api/resources/inline_users_inline_users/client.rs">inline_users_inline_users_list_with_mixed_type_cursor_pagination</a>(cursor: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;InlineUsersListUsersMixedTypePaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inline_users_inline_users
        .inline_users_inline_users_list_with_mixed_type_cursor_pagination(
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

**cursor:** `Option<Option<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/src/api/resources/inline_users_inline_users/client.rs">inline_users_inline_users_list_with_body_cursor_pagination</a>(request: InlineUsersInlineUsersListWithBodyCursorPaginationRequest) -> Result&lt;InlineUsersListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inline_users_inline_users
        .inline_users_inline_users_list_with_body_cursor_pagination(
            &InlineUsersInlineUsersListWithBodyCursorPaginationRequest {
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

**pagination:** `Option<InlineUsersWithCursor>` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/src/api/resources/inline_users_inline_users/client.rs">inline_users_inline_users_list_with_offset_pagination</a>(page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, per_page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, order: Option&lt;Option&lt;InlineUsersOrder&gt;&gt;, starting_after: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;InlineUsersListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inline_users_inline_users
        .inline_users_inline_users_list_with_offset_pagination(
            &InlineUsersInlineUsersListWithOffsetPaginationQueryRequest {
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

**page:** `Option<Option<i64>>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<Option<i64>>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<InlineUsersOrder>` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<Option<String>>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/src/api/resources/inline_users_inline_users/client.rs">inline_users_inline_users_list_with_double_offset_pagination</a>(page: Option&lt;Option&lt;Option&lt;f64&gt;&gt;&gt;, per_page: Option&lt;Option&lt;Option&lt;f64&gt;&gt;&gt;, order: Option&lt;Option&lt;InlineUsersOrder&gt;&gt;, starting_after: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;InlineUsersListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inline_users_inline_users
        .inline_users_inline_users_list_with_double_offset_pagination(
            &InlineUsersInlineUsersListWithDoubleOffsetPaginationQueryRequest {
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

**page:** `Option<Option<f64>>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<Option<f64>>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<InlineUsersOrder>` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<Option<String>>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/src/api/resources/inline_users_inline_users/client.rs">inline_users_inline_users_list_with_body_offset_pagination</a>(request: InlineUsersInlineUsersListWithBodyOffsetPaginationRequest) -> Result&lt;InlineUsersListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inline_users_inline_users
        .inline_users_inline_users_list_with_body_offset_pagination(
            &InlineUsersInlineUsersListWithBodyOffsetPaginationRequest {
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

**pagination:** `Option<InlineUsersWithPage>` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/src/api/resources/inline_users_inline_users/client.rs">inline_users_inline_users_list_with_offset_step_pagination</a>(page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, limit: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, order: Option&lt;Option&lt;InlineUsersOrder&gt;&gt;) -> Result&lt;InlineUsersListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inline_users_inline_users
        .inline_users_inline_users_list_with_offset_step_pagination(
            &InlineUsersInlineUsersListWithOffsetStepPaginationQueryRequest {
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

**page:** `Option<Option<i64>>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<Option<i64>>` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<InlineUsersOrder>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/src/api/resources/inline_users_inline_users/client.rs">inline_users_inline_users_list_with_offset_pagination_has_next_page</a>(page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, limit: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, order: Option&lt;Option&lt;InlineUsersOrder&gt;&gt;) -> Result&lt;InlineUsersListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inline_users_inline_users
        .inline_users_inline_users_list_with_offset_pagination_has_next_page(
            &InlineUsersInlineUsersListWithOffsetPaginationHasNextPageQueryRequest {
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

**page:** `Option<Option<i64>>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<Option<i64>>` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<InlineUsersOrder>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/src/api/resources/inline_users_inline_users/client.rs">inline_users_inline_users_list_with_extended_results</a>(cursor: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;InlineUsersListUsersExtendedResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inline_users_inline_users
        .inline_users_inline_users_list_with_extended_results(
            &InlineUsersInlineUsersListWithExtendedResultsQueryRequest {
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

**cursor:** `Option<Option<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/src/api/resources/inline_users_inline_users/client.rs">inline_users_inline_users_list_with_extended_results_and_optional_data</a>(cursor: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;InlineUsersListUsersExtendedOptionalListResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inline_users_inline_users
        .inline_users_inline_users_list_with_extended_results_and_optional_data(
            &InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataQueryRequest {
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

**cursor:** `Option<Option<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/src/api/resources/inline_users_inline_users/client.rs">inline_users_inline_users_list_usernames</a>(starting_after: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;UsernameCursor, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inline_users_inline_users
        .inline_users_inline_users_list_usernames(
            &InlineUsersInlineUsersListUsernamesQueryRequest {
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

**starting_after:** `Option<Option<String>>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/src/api/resources/inline_users_inline_users/client.rs">inline_users_inline_users_list_with_global_config</a>(offset: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;) -> Result&lt;InlineUsersUsernameContainer, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inline_users_inline_users
        .inline_users_inline_users_list_with_global_config(
            &InlineUsersInlineUsersListWithGlobalConfigQueryRequest {
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

**offset:** `Option<Option<i64>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithcursorpagination</a>(page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, per_page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;, starting_after: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithcursorpagination(
            &ListwithcursorpaginationQueryRequest {
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

**page:** `Option<Option<i64>>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<Option<i64>>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<Order>` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<Option<String>>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithmixedtypecursorpagination</a>(cursor: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;ListUsersMixedTypePaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithmixedtypecursorpagination(
            &ListwithmixedtypecursorpaginationQueryRequest {
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

**cursor:** `Option<Option<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithbodycursorpagination</a>(request: UsersListWithBodyCursorPaginationRequest) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithbodycursorpagination(
            &UsersListWithBodyCursorPaginationRequest {
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithtoplevelbodycursorpagination</a>(request: UsersListWithTopLevelBodyCursorPaginationRequest) -> Result&lt;ListUsersTopLevelCursorPaginationResponse, ApiError&gt;</code></summary>
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
use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithtoplevelbodycursorpagination(
            &UsersListWithTopLevelBodyCursorPaginationRequest {
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

**cursor:** `Option<Option<String>>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**filter:** `Option<Option<String>>` — An optional filter to apply to the results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithoffsetpagination</a>(page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, per_page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;, starting_after: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithoffsetpagination(
            &ListwithoffsetpaginationQueryRequest {
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

**page:** `Option<Option<i64>>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<Option<i64>>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<Order>` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<Option<String>>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithdoubleoffsetpagination</a>(page: Option&lt;Option&lt;Option&lt;f64&gt;&gt;&gt;, per_page: Option&lt;Option&lt;Option&lt;f64&gt;&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;, starting_after: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithdoubleoffsetpagination(
            &ListwithdoubleoffsetpaginationQueryRequest {
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

**page:** `Option<Option<f64>>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<Option<f64>>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Option<Order>` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<Option<String>>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithbodyoffsetpagination</a>(request: UsersListWithBodyOffsetPaginationRequest) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithbodyoffsetpagination(
            &UsersListWithBodyOffsetPaginationRequest {
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

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithoffsetsteppagination</a>(page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, limit: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithoffsetsteppagination(
            &ListwithoffsetsteppaginationQueryRequest {
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

**page:** `Option<Option<i64>>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<Option<i64>>` 

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

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithoffsetpaginationhasnextpage</a>(page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, limit: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, order: Option&lt;Option&lt;Order&gt;&gt;) -> Result&lt;ListUsersPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithoffsetpaginationhasnextpage(
            &ListwithoffsetpaginationhasnextpageQueryRequest {
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

**page:** `Option<Option<i64>>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Option<Option<i64>>` 

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

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithextendedresults</a>(cursor: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;ListUsersExtendedResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithextendedresults(
            &ListwithextendedresultsQueryRequest {
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

**cursor:** `Option<Option<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithextendedresultsandoptionaldata</a>(cursor: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;ListUsersExtendedOptionalListResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithextendedresultsandoptionaldata(
            &ListwithextendedresultsandoptionaldataQueryRequest {
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

**cursor:** `Option<Option<String>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listusernames</a>(starting_after: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;UsernameCursor, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listusernames(
            &ListusernamesQueryRequest {
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

**starting_after:** `Option<Option<String>>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listusernameswithoptionalresponse</a>(starting_after: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;UsernameCursor, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listusernameswithoptionalresponse(
            &ListusernameswithoptionalresponseQueryRequest {
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

**starting_after:** `Option<Option<String>>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithglobalconfig</a>(offset: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;) -> Result&lt;UsernameContainer, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithglobalconfig(
            &ListwithglobalconfigQueryRequest {
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

**offset:** `Option<Option<i64>>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithoptionaldata</a>(page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;) -> Result&lt;ListUsersOptionalDataPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithoptionaldata(
            &ListwithoptionaldataQueryRequest {
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

**page:** `Option<Option<i64>>` — Defaults to first page
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/src/api/resources/users/client.rs">listwithaliaseddata</a>(page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, per_page: Option&lt;Option&lt;Option&lt;i64&gt;&gt;&gt;, starting_after: Option&lt;Option&lt;Option&lt;String&gt;&gt;&gt;) -> Result&lt;ListUsersAliasedDataPaginationResponse, ApiError&gt;</code></summary>
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
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .users
        .listwithaliaseddata(
            &ListwithaliaseddataQueryRequest {
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

**page:** `Option<Option<i64>>` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Option<Option<i64>>` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `Option<Option<String>>` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

