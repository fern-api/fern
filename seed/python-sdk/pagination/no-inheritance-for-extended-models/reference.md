# Reference
## Complex
<details><summary><code>client.complex_.<a href="src/seed/complex_/client.py">search</a>(...) -> PaginatedConversationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, SingleFilterSearchRequest

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.complex_.search(
    index="index",
    query=SingleFilterSearchRequest(),
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

**index:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `SearchRequestQuery` 
    
</dd>
</dl>

<dl>
<dd>

**pagination:** `typing.Optional[StartingAfterPaging]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlineUsersInlineUsers
<details><summary><code>client.inline_users_inline_users.<a href="src/seed/inline_users_inline_users/client.py">inline_users_inline_users_list_with_cursor_pagination</a>(...) -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users_inline_users.inline_users_inline_users_list_with_cursor_pagination()

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

**page:** `typing.Optional[int]` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `typing.Optional[int]` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `typing.Optional[InlineUsersOrder]` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `typing.Optional[str]` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="src/seed/inline_users_inline_users/client.py">inline_users_inline_users_list_with_mixed_type_cursor_pagination</a>(...) -> InlineUsersListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users_inline_users.inline_users_inline_users_list_with_mixed_type_cursor_pagination()

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

**cursor:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="src/seed/inline_users_inline_users/client.py">inline_users_inline_users_list_with_body_cursor_pagination</a>(...) -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users_inline_users.inline_users_inline_users_list_with_body_cursor_pagination()

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

**pagination:** `typing.Optional[InlineUsersWithCursor]` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="src/seed/inline_users_inline_users/client.py">inline_users_inline_users_list_with_offset_pagination</a>(...) -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users_inline_users.inline_users_inline_users_list_with_offset_pagination()

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

**page:** `typing.Optional[int]` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `typing.Optional[int]` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `typing.Optional[InlineUsersOrder]` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `typing.Optional[str]` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="src/seed/inline_users_inline_users/client.py">inline_users_inline_users_list_with_double_offset_pagination</a>(...) -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users_inline_users.inline_users_inline_users_list_with_double_offset_pagination()

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

**page:** `typing.Optional[float]` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `typing.Optional[float]` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `typing.Optional[InlineUsersOrder]` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `typing.Optional[str]` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="src/seed/inline_users_inline_users/client.py">inline_users_inline_users_list_with_body_offset_pagination</a>(...) -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users_inline_users.inline_users_inline_users_list_with_body_offset_pagination()

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

**pagination:** `typing.Optional[InlineUsersWithPage]` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="src/seed/inline_users_inline_users/client.py">inline_users_inline_users_list_with_offset_step_pagination</a>(...) -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users_inline_users.inline_users_inline_users_list_with_offset_step_pagination()

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

**page:** `typing.Optional[int]` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `typing.Optional[int]` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `typing.Optional[InlineUsersOrder]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="src/seed/inline_users_inline_users/client.py">inline_users_inline_users_list_with_offset_pagination_has_next_page</a>(...) -> InlineUsersListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users_inline_users.inline_users_inline_users_list_with_offset_pagination_has_next_page()

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

**page:** `typing.Optional[int]` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `typing.Optional[int]` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `typing.Optional[InlineUsersOrder]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="src/seed/inline_users_inline_users/client.py">inline_users_inline_users_list_with_extended_results</a>(...) -> InlineUsersListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users_inline_users.inline_users_inline_users_list_with_extended_results()

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

**cursor:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="src/seed/inline_users_inline_users/client.py">inline_users_inline_users_list_with_extended_results_and_optional_data</a>(...) -> InlineUsersListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users_inline_users.inline_users_inline_users_list_with_extended_results_and_optional_data()

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

**cursor:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="src/seed/inline_users_inline_users/client.py">inline_users_inline_users_list_usernames</a>(...) -> UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users_inline_users.inline_users_inline_users_list_usernames()

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

**starting_after:** `typing.Optional[str]` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.inline_users_inline_users.<a href="src/seed/inline_users_inline_users/client.py">inline_users_inline_users_list_with_global_config</a>(...) -> InlineUsersUsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users_inline_users.inline_users_inline_users_list_with_global_config()

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

**offset:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Users
<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithcursorpagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithcursorpagination()

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

**page:** `typing.Optional[int]` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `typing.Optional[int]` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `typing.Optional[Order]` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `typing.Optional[str]` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithmixedtypecursorpagination</a>(...) -> ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithmixedtypecursorpagination()

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

**cursor:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithbodycursorpagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithbodycursorpagination()

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

**pagination:** `typing.Optional[WithCursor]` 

The object that contains the cursor used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithtoplevelbodycursorpagination</a>(...) -> ListUsersTopLevelCursorPaginationResponse</code></summary>
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

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithtoplevelbodycursorpagination()

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

**cursor:** `typing.Optional[str]` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**filter:** `typing.Optional[str]` — An optional filter to apply to the results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithoffsetpagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithoffsetpagination()

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

**page:** `typing.Optional[int]` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `typing.Optional[int]` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `typing.Optional[Order]` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `typing.Optional[str]` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithdoubleoffsetpagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithdoubleoffsetpagination()

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

**page:** `typing.Optional[float]` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `typing.Optional[float]` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**order:** `typing.Optional[Order]` 
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `typing.Optional[str]` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithbodyoffsetpagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithbodyoffsetpagination()

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

**pagination:** `typing.Optional[WithPage]` 

The object that contains the offset used for pagination
in order to fetch the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithoffsetsteppagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithoffsetsteppagination()

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

**page:** `typing.Optional[int]` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `typing.Optional[int]` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `typing.Optional[Order]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithoffsetpaginationhasnextpage</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithoffsetpaginationhasnextpage()

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

**page:** `typing.Optional[int]` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**limit:** `typing.Optional[int]` 

The maximum number of elements to return.
This is also used as the step size in this
paginated endpoint.
    
</dd>
</dl>

<dl>
<dd>

**order:** `typing.Optional[Order]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithextendedresults</a>(...) -> ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithextendedresults()

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

**cursor:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithextendedresultsandoptionaldata</a>(...) -> ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithextendedresultsandoptionaldata()

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

**cursor:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listusernames</a>(...) -> UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listusernames()

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

**starting_after:** `typing.Optional[str]` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listusernameswithoptionalresponse</a>(...) -> UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listusernameswithoptionalresponse()

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

**starting_after:** `typing.Optional[str]` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithglobalconfig</a>(...) -> UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithglobalconfig()

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

**offset:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithoptionaldata</a>(...) -> ListUsersOptionalDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithoptionaldata()

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

**page:** `typing.Optional[int]` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithaliaseddata</a>(...) -> ListUsersAliasedDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi

client = SeedApi(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.listwithaliaseddata()

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

**page:** `typing.Optional[int]` — Defaults to first page
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `typing.Optional[int]` — Defaults to per page
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `typing.Optional[str]` 

The cursor used for pagination in order to fetch
the next page of results.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

