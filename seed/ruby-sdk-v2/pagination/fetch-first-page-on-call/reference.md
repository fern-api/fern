# Reference
## Conversations
<details><summary><code>client.complex.<a href="/lib/seed/complex/client.rb">search</a>(index:, request) -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::Complex::Types::Conversation` in the `conversations` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Complex::Types::PaginatedConversationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.complex.search(
  index: "index",
  pagination: {
    per_page: 1,
    starting_after: "starting_after"
  },
  query: {
    field: "field",
    operator: "=",
    value: "value"
  }
)
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

**request:** `Seed::Complex::Types::SearchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Complex::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlineUsers InlineUsers
<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_cursor_pagination</a>() -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::InlineUsers::InlineUsers::Types::User` in the `users` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination(
  page: 1,
  per_page: 1,
  order: "asc",
  starting_after: "starting_after"
)
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

**page:** `Integer` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Integer` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::InlineUsers::InlineUsers::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_mixed_type_cursor_pagination</a>() -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::InlineUsers::InlineUsers::Types::User` in the `users` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::InlineUsers::InlineUsers::Types::ListUsersMixedTypePaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_mixed_type_cursor_pagination(cursor: "cursor")
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

**cursor:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_body_cursor_pagination</a>(request) -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::InlineUsers::InlineUsers::Types::User` in the `users` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_mixed_type_cursor_pagination
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

**pagination:** `Seed::InlineUsers::InlineUsers::Types::WithCursor` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_offset_pagination</a>() -> Seed::Internal::OffsetItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::InlineUsers::InlineUsers::Types::User` in the `users` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination(
  page: 1,
  per_page: 1,
  order: "asc",
  starting_after: "starting_after"
)
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

**page:** `Integer` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Integer` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::InlineUsers::InlineUsers::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_double_offset_pagination</a>() -> Seed::Internal::OffsetItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::InlineUsers::InlineUsers::Types::User` in the `users` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination(
  page: 1.1,
  per_page: 1.1,
  order: "asc",
  starting_after: "starting_after"
)
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

**page:** `Float` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Float` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::InlineUsers::InlineUsers::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_body_offset_pagination</a>(request) -> Seed::Internal::OffsetItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::InlineUsers::InlineUsers::Types::User` in the `users` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_mixed_type_cursor_pagination
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

**pagination:** `Seed::InlineUsers::InlineUsers::Types::WithPage` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_offset_step_pagination</a>() -> Seed::Internal::OffsetItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::InlineUsers::InlineUsers::Types::User` in the `users` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination(
  page: 1,
  order: "asc"
)
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

**page:** `Integer` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Integer` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::InlineUsers::InlineUsers::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_offset_pagination_has_next_page</a>() -> Seed::Internal::OffsetItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::InlineUsers::InlineUsers::Types::User` in the `users` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination(
  page: 1,
  order: "asc"
)
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

**page:** `Integer` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Integer` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::InlineUsers::InlineUsers::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_extended_results</a>() -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::InlineUsers::InlineUsers::Types::User` in the `users` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination
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

**cursor:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_extended_results_and_optional_data</a>() -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::InlineUsers::InlineUsers::Types::User` in the `users` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedOptionalListResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination
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

**cursor:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_usernames</a>() -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `String` in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Types::UsernameCursor`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination(starting_after: "starting_after")
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

**starting_after:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_global_config</a>() -> Seed::Internal::OffsetItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::OffsetItemIterator` that yields each `String` in the `results` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::InlineUsers::InlineUsers::Types::UsernameContainer`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination
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

**offset:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_cursor_pagination</a>() -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::Users::Types::User` in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(
  page: 1,
  per_page: 1,
  order: "asc",
  starting_after: "starting_after"
)
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

**page:** `Integer` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Integer` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::Users::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_mixed_type_cursor_pagination</a>() -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::Users::Types::User` in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::ListUsersMixedTypePaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_mixed_type_cursor_pagination(cursor: "cursor")
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

**cursor:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_body_cursor_pagination</a>(request) -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::Users::Types::User` in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_mixed_type_cursor_pagination
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

**pagination:** `Seed::Users::Types::WithCursor` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_top_level_body_cursor_pagination</a>(request) -> Seed::Internal::CursorItemIterator</code></summary>
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

Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::Users::Types::User` in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::ListUsersTopLevelCursorPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_top_level_body_cursor_pagination(
  cursor: "initial_cursor",
  filter: "active"
)
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

**cursor:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**filter:** `String` — An optional filter to apply to the results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_offset_pagination</a>() -> Seed::Internal::OffsetItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::Users::Types::User` in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(
  page: 1,
  per_page: 1,
  order: "asc",
  starting_after: "starting_after"
)
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

**page:** `Integer` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Integer` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::Users::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_double_offset_pagination</a>() -> Seed::Internal::OffsetItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::Users::Types::User` in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(
  page: 1.1,
  per_page: 1.1,
  order: "asc",
  starting_after: "starting_after"
)
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

**page:** `Float` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Float` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::Users::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_body_offset_pagination</a>(request) -> Seed::Internal::OffsetItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::Users::Types::User` in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_mixed_type_cursor_pagination
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

**pagination:** `Seed::Users::Types::WithPage` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_offset_step_pagination</a>() -> Seed::Internal::OffsetItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::Users::Types::User` in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(
  page: 1,
  order: "asc"
)
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

**page:** `Integer` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Integer` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::Users::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_offset_pagination_has_next_page</a>() -> Seed::Internal::OffsetItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::Users::Types::User` in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::ListUsersPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(
  page: 1,
  order: "asc"
)
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

**page:** `Integer` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Integer` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::Users::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_extended_results</a>() -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::Users::Types::User` in the `users` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::ListUsersExtendedResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination
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

**cursor:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_extended_results_and_optional_data</a>() -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `Seed::Users::Types::User` in the `users` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::ListUsersExtendedOptionalListResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination
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

**cursor:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_usernames</a>() -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `String` in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Types::UsernameCursor`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(starting_after: "starting_after")
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

**starting_after:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_usernames_with_optional_response</a>() -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each `String` in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Types::UsernameCursor`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(starting_after: "starting_after")
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

**starting_after:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_global_config</a>() -> Seed::Internal::OffsetItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::OffsetItemIterator` that yields each `String` in the `results` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::UsernameContainer`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination
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

**offset:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_optional_data</a>() -> Seed::Internal::OffsetItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::OffsetItemIterator` that yields each `Seed::Users::Types::User` in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::ListUsersOptionalDataPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_optional_data(page: 1)
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

**page:** `Integer` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_aliased_data</a>() -> Seed::Internal::CursorItemIterator</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a `Seed::Internal::CursorItemIterator` that yields each item in the `data` field of every page, requesting pages as they are needed. Call `pages` on it to get each page as a `Seed::Users::Types::ListUsersAliasedDataPaginationResponse`, including its other fields.

The request for the first page is sent by this call, so an API error for the first page is raised here. Later pages are requested while iterating, and an API error for one of them is raised by the loop.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_aliased_data(
  page: 1,
  per_page: 1,
  starting_after: "starting_after"
)
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

**page:** `Integer` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `Integer` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

