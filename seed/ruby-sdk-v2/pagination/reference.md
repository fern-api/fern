# Reference
## Conversations
<details><summary><code>client.complex.<a href="/lib/fern_pagination/complex/client.rb">search</a>(index, request) -> FernPagination::Complex::Types::PaginatedConversationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.complex.search(
  index: 'index',
  pagination: {
    per_page: 1,
    starting_after: 'starting_after'
  },
  query: {
    field: 'field',
    operator: '=',
    value: 'value'
  }
);
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

**request:** `FernPagination::Complex::Types::SearchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPagination::Complex::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlineUsers InlineUsers
<details><summary><code>client.inline_users.inline_users.<a href="/lib/fern_pagination/inline_users/inline_users/client.rb">list_with_cursor_pagination</a>() -> FernPagination::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination(
  page: 1,
  per_page: 1,
  order: 'asc',
  starting_after: 'starting_after'
);
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

**order:** `FernPagination::InlineUsers::InlineUsers::Types::Order` 
    
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

**request_options:** `FernPagination::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/fern_pagination/inline_users/inline_users/client.rb">list_with_mixed_type_cursor_pagination</a>() -> FernPagination::InlineUsers::InlineUsers::Types::ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_mixed_type_cursor_pagination(cursor: 'cursor');
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

**request_options:** `FernPagination::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/fern_pagination/inline_users/inline_users/client.rb">list_with_body_cursor_pagination</a>(request) -> FernPagination::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_mixed_type_cursor_pagination();
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

**pagination:** `FernPagination::InlineUsers::InlineUsers::Types::WithCursor` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPagination::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/fern_pagination/inline_users/inline_users/client.rb">list_with_offset_pagination</a>() -> FernPagination::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination(
  page: 1,
  per_page: 1,
  order: 'asc',
  starting_after: 'starting_after'
);
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

**order:** `FernPagination::InlineUsers::InlineUsers::Types::Order` 
    
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

**request_options:** `FernPagination::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/fern_pagination/inline_users/inline_users/client.rb">list_with_double_offset_pagination</a>() -> FernPagination::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination(
  page: 1.1,
  per_page: 1.1,
  order: 'asc',
  starting_after: 'starting_after'
);
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

**order:** `FernPagination::InlineUsers::InlineUsers::Types::Order` 
    
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

**request_options:** `FernPagination::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/fern_pagination/inline_users/inline_users/client.rb">list_with_body_offset_pagination</a>(request) -> FernPagination::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_mixed_type_cursor_pagination();
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

**pagination:** `FernPagination::InlineUsers::InlineUsers::Types::WithPage` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPagination::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/fern_pagination/inline_users/inline_users/client.rb">list_with_offset_step_pagination</a>() -> FernPagination::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination(
  page: 1,
  order: 'asc'
);
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

**order:** `FernPagination::InlineUsers::InlineUsers::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPagination::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/fern_pagination/inline_users/inline_users/client.rb">list_with_offset_pagination_has_next_page</a>() -> FernPagination::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination(
  page: 1,
  order: 'asc'
);
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

**order:** `FernPagination::InlineUsers::InlineUsers::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPagination::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/fern_pagination/inline_users/inline_users/client.rb">list_with_extended_results</a>() -> FernPagination::InlineUsers::InlineUsers::Types::ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination();
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

**request_options:** `FernPagination::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/fern_pagination/inline_users/inline_users/client.rb">list_with_extended_results_and_optional_data</a>() -> FernPagination::InlineUsers::InlineUsers::Types::ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination();
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

**request_options:** `FernPagination::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/fern_pagination/inline_users/inline_users/client.rb">list_usernames</a>() -> FernPagination::Types::UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination(starting_after: 'starting_after');
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

**request_options:** `FernPagination::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/fern_pagination/inline_users/inline_users/client.rb">list_with_global_config</a>() -> FernPagination::InlineUsers::InlineUsers::Types::UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination();
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

**request_options:** `FernPagination::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_with_cursor_pagination</a>() -> FernPagination::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(
  page: 1,
  per_page: 1,
  order: 'asc',
  starting_after: 'starting_after'
);
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

**order:** `FernPagination::Users::Types::Order` 
    
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

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_with_mixed_type_cursor_pagination</a>() -> FernPagination::Users::Types::ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_mixed_type_cursor_pagination(cursor: 'cursor');
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

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_with_body_cursor_pagination</a>(request) -> FernPagination::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_mixed_type_cursor_pagination();
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

**pagination:** `FernPagination::Users::Types::WithCursor` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_with_top_level_body_cursor_pagination</a>(request) -> FernPagination::Users::Types::ListUsersTopLevelCursorPaginationResponse</code></summary>
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

```ruby
client.users.list_with_top_level_body_cursor_pagination(
  cursor: 'initial_cursor',
  filter: 'active'
);
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

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_with_offset_pagination</a>() -> FernPagination::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(
  page: 1,
  per_page: 1,
  order: 'asc',
  starting_after: 'starting_after'
);
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

**order:** `FernPagination::Users::Types::Order` 
    
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

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_with_double_offset_pagination</a>() -> FernPagination::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(
  page: 1.1,
  per_page: 1.1,
  order: 'asc',
  starting_after: 'starting_after'
);
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

**order:** `FernPagination::Users::Types::Order` 
    
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

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_with_body_offset_pagination</a>(request) -> FernPagination::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_mixed_type_cursor_pagination();
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

**pagination:** `FernPagination::Users::Types::WithPage` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_with_offset_step_pagination</a>() -> FernPagination::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(
  page: 1,
  order: 'asc'
);
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

**order:** `FernPagination::Users::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_with_offset_pagination_has_next_page</a>() -> FernPagination::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(
  page: 1,
  order: 'asc'
);
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

**order:** `FernPagination::Users::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_with_extended_results</a>() -> FernPagination::Users::Types::ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination();
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

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_with_extended_results_and_optional_data</a>() -> FernPagination::Users::Types::ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination();
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

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_usernames</a>() -> FernPagination::Types::UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(starting_after: 'starting_after');
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

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_usernames_with_optional_response</a>() -> FernPagination::Types::UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination(starting_after: 'starting_after');
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

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_with_global_config</a>() -> FernPagination::Users::Types::UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination();
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

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/fern_pagination/users/client.rb">list_with_optional_data</a>() -> FernPagination::Users::Types::ListUsersOptionalDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_optional_data(page: 1);
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

**request_options:** `FernPagination::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
