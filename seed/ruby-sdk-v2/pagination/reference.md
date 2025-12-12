# Reference
## Conversations
<details><summary><code>client.complex.<a href="/lib/seed/complex/client.rb">search</a>(index, request) -> Seed::Complex::Types::PaginatedConversationResponse</code></summary>
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
<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_cursor_pagination</a>() -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_mixed_type_cursor_pagination</a>() -> Seed::InlineUsers::InlineUsers::Types::ListUsersMixedTypePaginationResponse</code></summary>
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

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_body_cursor_pagination</a>(request) -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_offset_pagination</a>() -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_double_offset_pagination</a>() -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_body_offset_pagination</a>(request) -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_offset_step_pagination</a>() -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_offset_pagination_has_next_page</a>() -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_extended_results</a>() -> Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedResponse</code></summary>
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

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_extended_results_and_optional_data</a>() -> Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedOptionalListResponse</code></summary>
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

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_usernames</a>() -> Seed::Types::UsernameCursor</code></summary>
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

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users.inline_users.<a href="/lib/seed/inline_users/inline_users/client.rb">list_with_global_config</a>() -> Seed::InlineUsers::InlineUsers::Types::UsernameContainer</code></summary>
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

**request_options:** `Seed::InlineUsers::InlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_cursor_pagination</a>() -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_mixed_type_cursor_pagination</a>() -> Seed::Users::Types::ListUsersMixedTypePaginationResponse</code></summary>
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

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_body_cursor_pagination</a>(request) -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_offset_pagination</a>() -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_double_offset_pagination</a>() -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_body_offset_pagination</a>(request) -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_offset_step_pagination</a>() -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_offset_pagination_has_next_page</a>() -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_extended_results</a>() -> Seed::Users::Types::ListUsersExtendedResponse</code></summary>
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

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_extended_results_and_optional_data</a>() -> Seed::Users::Types::ListUsersExtendedOptionalListResponse</code></summary>
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

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_usernames</a>() -> Seed::Types::UsernameCursor</code></summary>
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

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_usernames_with_optional_response</a>() -> Seed::Types::UsernameCursor</code></summary>
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

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_global_config</a>() -> Seed::Users::Types::UsernameContainer</code></summary>
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

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">list_with_optional_data</a>() -> Seed::Users::Types::ListUsersOptionalDataPaginationResponse</code></summary>
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

**request_options:** `Seed::Users::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
