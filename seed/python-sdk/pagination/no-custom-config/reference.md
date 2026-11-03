# Reference
## Conversations
<details><summary><code>client.complex_.<a href="src/seed/complex_/client.py#L33-L84">search</a>(...) -> PaginatedConversationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination
from seed.complex_ import StartingAfterPaging, SingleFilterSearchRequest

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.complex_.search(
    index="index",
    pagination=StartingAfterPaging(
        per_page=1,
        starting_after="starting_after",
    ),
    query=SingleFilterSearchRequest(
        field="field",
        operator="=",
        value="value",
    ),
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

**request:** `SearchRequest` 
    
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

## InlineUsers InlineUsers
<details><summary><code>client.inline_users.inline_users.<a href="src/seed/inline_users/inline_users/client.py#L40-L93">list_with_cursor_pagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users.inline_users.list_with_cursor_pagination(
    page=1,
    per_page=1,
    order="asc",
    starting_after="starting_after",
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

<details><summary><code>client.inline_users.inline_users.<a href="src/seed/inline_users/inline_users/client.py#L95-L129">list_with_mixed_type_cursor_pagination</a>(...) -> ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users.inline_users.list_with_mixed_type_cursor_pagination(
    cursor="cursor",
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

<details><summary><code>client.inline_users.inline_users.<a href="src/seed/inline_users/inline_users/client.py#L131-L168">list_with_body_cursor_pagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users.inline_users.list_with_mixed_type_cursor_pagination()

```
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

<details><summary><code>client.inline_users.inline_users.<a href="src/seed/inline_users/inline_users/client.py#L170-L223">list_with_offset_pagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users.inline_users.list_with_cursor_pagination(
    page=1,
    per_page=1,
    order="asc",
    starting_after="starting_after",
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

<details><summary><code>client.inline_users.inline_users.<a href="src/seed/inline_users/inline_users/client.py#L225-L278">list_with_double_offset_pagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users.inline_users.list_with_cursor_pagination(
    page=1.1,
    per_page=1.1,
    order="asc",
    starting_after="starting_after",
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

<details><summary><code>client.inline_users.inline_users.<a href="src/seed/inline_users/inline_users/client.py#L280-L317">list_with_body_offset_pagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users.inline_users.list_with_mixed_type_cursor_pagination()

```
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

<details><summary><code>client.inline_users.inline_users.<a href="src/seed/inline_users/inline_users/client.py#L319-L368">list_with_offset_step_pagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users.inline_users.list_with_offset_step_pagination(
    page=1,
    limit=1,
    order="asc",
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

<details><summary><code>client.inline_users.inline_users.<a href="src/seed/inline_users/inline_users/client.py#L370-L421">list_with_offset_pagination_has_next_page</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users.inline_users.list_with_offset_step_pagination(
    page=1,
    limit=1,
    order="asc",
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

<details><summary><code>client.inline_users.inline_users.<a href="src/seed/inline_users/inline_users/client.py#L423-L459">list_with_extended_results</a>(...) -> ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination
import uuid

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users.inline_users.list_with_extended_results(
    cursor=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
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

**cursor:** `typing.Optional[uuid.UUID]` 
    
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

<details><summary><code>client.inline_users.inline_users.<a href="src/seed/inline_users/inline_users/client.py#L461-L499">list_with_extended_results_and_optional_data</a>(...) -> ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination
import uuid

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users.inline_users.list_with_extended_results(
    cursor=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
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

**cursor:** `typing.Optional[uuid.UUID]` 
    
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

<details><summary><code>client.inline_users.inline_users.<a href="src/seed/inline_users/inline_users/client.py#L501-L535">list_usernames</a>(...) -> UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users.inline_users.list_with_cursor_pagination(
    starting_after="starting_after",
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

<details><summary><code>client.inline_users.inline_users.<a href="src/seed/inline_users/inline_users/client.py#L537-L569">list_with_global_config</a>(...) -> UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inline_users.inline_users.list_with_global_config(
    offset=1,
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
<details><summary><code>client.users.<a href="src/seed/users/client.py#L43-L96">list_with_cursor_pagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_cursor_pagination(
    page=1,
    per_page=1,
    order="asc",
    starting_after="starting_after",
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L98-L130">list_with_mixed_type_cursor_pagination</a>(...) -> ListUsersMixedTypePaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_mixed_type_cursor_pagination(
    cursor="cursor",
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L132-L169">list_with_body_cursor_pagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_mixed_type_cursor_pagination()

```
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L171-L219">list_with_top_level_body_cursor_pagination</a>(...) -> ListUsersTopLevelCursorPaginationResponse</code></summary>
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
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_top_level_body_cursor_pagination(
    cursor="initial_cursor",
    filter="active",
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L221-L274">list_with_offset_pagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_cursor_pagination(
    page=1,
    per_page=1,
    order="asc",
    starting_after="starting_after",
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L276-L329">list_with_double_offset_pagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_cursor_pagination(
    page=1.1,
    per_page=1.1,
    order="asc",
    starting_after="starting_after",
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L331-L368">list_with_body_offset_pagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_mixed_type_cursor_pagination()

```
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L370-L419">list_with_offset_step_pagination</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_offset_step_pagination(
    page=1,
    limit=1,
    order="asc",
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L421-L470">list_with_offset_pagination_has_next_page</a>(...) -> ListUsersPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_offset_step_pagination(
    page=1,
    limit=3,
    order="asc",
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L472-L508">list_with_extended_results</a>(...) -> ListUsersExtendedResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination
import uuid

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_extended_results(
    cursor=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
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

**cursor:** `typing.Optional[uuid.UUID]` 
    
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L510-L548">list_with_extended_results_and_optional_data</a>(...) -> ListUsersExtendedOptionalListResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination
import uuid

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_extended_results(
    cursor=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
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

**cursor:** `typing.Optional[uuid.UUID]` 
    
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L550-L584">list_usernames</a>(...) -> UsernameCursor</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_cursor_pagination(
    starting_after="starting_after",
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L586-L622">list_usernames_with_optional_response</a>(...) -> typing.Optional[UsernameCursor]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_cursor_pagination(
    starting_after="starting_after",
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L624-L656">list_with_global_config</a>(...) -> UsernameContainer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_global_config(
    offset=1,
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L658-L691">list_with_optional_data</a>(...) -> ListUsersOptionalDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_optional_data(
    page=1,
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

<details><summary><code>client.users.<a href="src/seed/users/client.py#L693-L742">list_with_aliased_data</a>(...) -> ListUsersAliasedDataPaginationResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination

client = SeedPagination(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.users.list_with_aliased_data(
    page=1,
    per_page=1,
    starting_after="starting_after",
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

