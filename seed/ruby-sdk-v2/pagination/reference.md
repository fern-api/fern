# Reference
## Complex
<details><summary><code>client.complex.<a href="/lib/seed/complex/client.rb">search</a>(index, request) -> Seed::Types::PaginatedConversationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.complex.search(
  index: "index",
  query: {}
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

**pagination:** `Seed::Types::StartingAfterPaging` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `Seed::Types::SearchRequestQuery` 
    
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

## InlineUsersInlineUsers
<details><summary><code>client.inline_users_inline_users.<a href="/lib/seed/inline_users_inline_users/client.rb">inline_users_inline_users_list_with_cursor_pagination</a>() -> Seed::Types::InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users_inline_users.inline_users_inline_users_list_with_cursor_pagination
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

**order:** `Seed::Types::InlineUsersOrder` 
    
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

**request_options:** `Seed::InlineUsersInlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/lib/seed/inline_users_inline_users/client.rb">inline_users_inline_users_list_with_mixed_type_cursor_pagination</a>() -> Seed::Types::InlineUsersListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users_inline_users.inline_users_inline_users_list_with_mixed_type_cursor_pagination
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

**request_options:** `Seed::InlineUsersInlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/lib/seed/inline_users_inline_users/client.rb">inline_users_inline_users_list_with_body_cursor_pagination</a>(request) -> Seed::Types::InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users_inline_users.inline_users_inline_users_list_with_body_cursor_pagination
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

**pagination:** `Seed::Types::InlineUsersWithCursor` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsersInlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/lib/seed/inline_users_inline_users/client.rb">inline_users_inline_users_list_with_offset_pagination</a>() -> Seed::Types::InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users_inline_users.inline_users_inline_users_list_with_offset_pagination
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

**order:** `Seed::Types::InlineUsersOrder` 
    
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

**request_options:** `Seed::InlineUsersInlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/lib/seed/inline_users_inline_users/client.rb">inline_users_inline_users_list_with_double_offset_pagination</a>() -> Seed::Types::InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users_inline_users.inline_users_inline_users_list_with_double_offset_pagination
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

**order:** `Seed::Types::InlineUsersOrder` 
    
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

**request_options:** `Seed::InlineUsersInlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/lib/seed/inline_users_inline_users/client.rb">inline_users_inline_users_list_with_body_offset_pagination</a>(request) -> Seed::Types::InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users_inline_users.inline_users_inline_users_list_with_body_offset_pagination
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

**pagination:** `Seed::Types::InlineUsersWithPage` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsersInlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/lib/seed/inline_users_inline_users/client.rb">inline_users_inline_users_list_with_offset_step_pagination</a>() -> Seed::Types::InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users_inline_users.inline_users_inline_users_list_with_offset_step_pagination
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

**order:** `Seed::Types::InlineUsersOrder` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsersInlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/lib/seed/inline_users_inline_users/client.rb">inline_users_inline_users_list_with_offset_pagination_has_next_page</a>() -> Seed::Types::InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users_inline_users.inline_users_inline_users_list_with_offset_pagination_has_next_page
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

**order:** `Seed::Types::InlineUsersOrder` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlineUsersInlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/lib/seed/inline_users_inline_users/client.rb">inline_users_inline_users_list_with_extended_results</a>() -> Seed::Types::InlineUsersListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users_inline_users.inline_users_inline_users_list_with_extended_results
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

**request_options:** `Seed::InlineUsersInlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/lib/seed/inline_users_inline_users/client.rb">inline_users_inline_users_list_with_extended_results_and_optional_data</a>() -> Seed::Types::InlineUsersListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users_inline_users.inline_users_inline_users_list_with_extended_results_and_optional_data
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

**request_options:** `Seed::InlineUsersInlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/lib/seed/inline_users_inline_users/client.rb">inline_users_inline_users_list_usernames</a>() -> Seed::Types::UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users_inline_users.inline_users_inline_users_list_usernames
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

**request_options:** `Seed::InlineUsersInlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="/lib/seed/inline_users_inline_users/client.rb">inline_users_inline_users_list_with_global_config</a>() -> Seed::Types::InlineUsersUsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.inline_users_inline_users.inline_users_inline_users_list_with_global_config
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

**request_options:** `Seed::InlineUsersInlineUsers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithcursorpagination</a>() -> Seed::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listwithcursorpagination
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

**order:** `Seed::Types::Order` 
    
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithmixedtypecursorpagination</a>() -> Seed::Types::ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listwithmixedtypecursorpagination
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithbodycursorpagination</a>(request) -> Seed::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listwithbodycursorpagination
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

**pagination:** `Seed::Types::WithCursor` 

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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithtoplevelbodycursorpagination</a>(request) -> Seed::Types::ListUsersTopLevelCursorPaginationResponse</code></summary>
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
client.users.listwithtoplevelbodycursorpagination
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithoffsetpagination</a>() -> Seed::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listwithoffsetpagination
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

**order:** `Seed::Types::Order` 
    
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithdoubleoffsetpagination</a>() -> Seed::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listwithdoubleoffsetpagination
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

**order:** `Seed::Types::Order` 
    
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithbodyoffsetpagination</a>(request) -> Seed::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listwithbodyoffsetpagination
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

**pagination:** `Seed::Types::WithPage` 

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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithoffsetsteppagination</a>() -> Seed::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listwithoffsetsteppagination
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

**order:** `Seed::Types::Order` 
    
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithoffsetpaginationhasnextpage</a>() -> Seed::Types::ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listwithoffsetpaginationhasnextpage
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

**order:** `Seed::Types::Order` 
    
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithextendedresults</a>() -> Seed::Types::ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listwithextendedresults
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithextendedresultsandoptionaldata</a>() -> Seed::Types::ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listwithextendedresultsandoptionaldata
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listusernames</a>() -> Seed::Types::UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listusernames
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listusernameswithoptionalresponse</a>() -> Seed::Types::UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listusernameswithoptionalresponse
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithglobalconfig</a>() -> Seed::Types::UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listwithglobalconfig
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithoptionaldata</a>() -> Seed::Types::ListUsersOptionalDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listwithoptionaldata
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

<details><summary><code>client.users.<a href="/lib/seed/users/client.rb">listwithaliaseddata</a>() -> Seed::Types::ListUsersAliasedDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.users.listwithaliaseddata
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

