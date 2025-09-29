# Reference
## Conversations
<details><summary><code>client.Complex.Search(Index, request) -> Seed::Complex::Types::PaginatedConversationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.complex.search({
  pagination:{
    per_page:1,
    starting_after:'starting_after'
  }
});
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
</dd>
</dl>


</dd>
</dl>
</details>

## InlineUsers InlineUsers
<details><summary><code>client.InlineUsers.InlineUsers.ListWithCursorPagination() -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination({
  page:1,
  perPage:1,
  startingAfter:'starting_after'
});
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

**perPage:** `Integer` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::InlineUsers::InlineUsers::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.ListWithMixedTypeCursorPagination() -> Seed::InlineUsers::InlineUsers::Types::ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_mixed_type_cursor_pagination({
  cursor:'cursor'
});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.ListWithBodyCursorPagination(request) -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_mixed_type_cursor_pagination({});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.ListWithOffsetPagination() -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination({
  page:1,
  perPage:1,
  startingAfter:'starting_after'
});
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

**perPage:** `Integer` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::InlineUsers::InlineUsers::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.ListWithDoubleOffsetPagination() -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination({
  page:1.1,
  perPage:1.1,
  startingAfter:'starting_after'
});
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

**perPage:** `Integer` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::InlineUsers::InlineUsers::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.ListWithBodyOffsetPagination(request) -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_mixed_type_cursor_pagination({});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.ListWithOffsetStepPagination() -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination({
  page:1
});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.ListWithOffsetPaginationHasNextPage() -> Seed::InlineUsers::InlineUsers::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination({
  page:1
});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.ListWithExtendedResults() -> Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination({});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.ListWithExtendedResultsAndOptionalData() -> Seed::InlineUsers::InlineUsers::Types::ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination({});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.ListUsernames() -> Seed::Types::UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination({
  startingAfter:'starting_after'
});
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

**startingAfter:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.InlineUsers.InlineUsers.ListWithGlobalConfig() -> Seed::InlineUsers::InlineUsers::Types::UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users.inline_users.list_with_cursor_pagination({});
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
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.Users.ListWithCursorPagination() -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination({
  page:1,
  perPage:1,
  startingAfter:'starting_after'
});
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

**perPage:** `Integer` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::Users::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithMixedTypeCursorPagination() -> Seed::Users::Types::ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_mixed_type_cursor_pagination({
  cursor:'cursor'
});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithBodyCursorPagination(request) -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_mixed_type_cursor_pagination({});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithOffsetPagination() -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination({
  page:1,
  perPage:1,
  startingAfter:'starting_after'
});
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

**perPage:** `Integer` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::Users::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithDoubleOffsetPagination() -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination({
  page:1.1,
  perPage:1.1,
  startingAfter:'starting_after'
});
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

**perPage:** `Integer` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `Seed::Users::Types::Order` 
    
</dd>
</dl>

<dl>
<dd>

**startingAfter:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithBodyOffsetPagination(request) -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_mixed_type_cursor_pagination({});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithOffsetStepPagination() -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination({
  page:1
});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithOffsetPaginationHasNextPage() -> Seed::Users::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination({
  page:1
});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithExtendedResults() -> Seed::Users::Types::ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination({});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithExtendedResultsAndOptionalData() -> Seed::Users::Types::ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination({});
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListUsernames() -> Seed::Types::UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination({
  startingAfter:'starting_after'
});
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

**startingAfter:** `String` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Users.ListWithGlobalConfig() -> Seed::Users::Types::UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.list_with_cursor_pagination({});
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
</dd>
</dl>


</dd>
</dl>
</details>
