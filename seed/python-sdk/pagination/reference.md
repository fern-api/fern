# Reference
## Conversations
<details><summary><code>client.complex_.<a href="src/seed/complex_/client.py">search</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination
from seed.complex_ import SingleFilterSearchRequest, StartingAfterPaging

client = SeedPagination(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.complex_.search(
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
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

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

## Users
<details><summary><code>client.users.<a href="src/seed/users/client.py">list_with_cursor_pagination</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_cursor_pagination(
    page=1,
    per_page=1,
    order="asc",
    starting_after="starting_after",
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page

```
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

<details><summary><code>client.users.<a href="src/seed/users/client.py">list_with_mixed_type_cursor_pagination</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_mixed_type_cursor_pagination(
    cursor="cursor",
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page

```
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

<details><summary><code>client.users.<a href="src/seed/users/client.py">list_with_body_cursor_pagination</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination
from seed.users import WithCursor

client = SeedPagination(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_body_cursor_pagination(
    pagination=WithCursor(
        cursor="cursor",
    ),
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page

```
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

<details><summary><code>client.users.<a href="src/seed/users/client.py">list_with_offset_pagination</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_offset_pagination(
    page=1,
    per_page=1,
    order="asc",
    starting_after="starting_after",
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page

```
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

<details><summary><code>client.users.<a href="src/seed/users/client.py">list_with_double_offset_pagination</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_double_offset_pagination(
    page=1.1,
    per_page=1.1,
    order="asc",
    starting_after="starting_after",
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page

```
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

<details><summary><code>client.users.<a href="src/seed/users/client.py">list_with_body_offset_pagination</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPagination
from seed.users import WithPage

client = SeedPagination(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_body_offset_pagination(
    pagination=WithPage(
        page=1,
    ),
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page

```
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

<details><summary><code>client.users.<a href="src/seed/users/client.py">list_with_offset_step_pagination</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_offset_step_pagination(
    page=1,
    limit=1,
    order="asc",
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page

```
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

<details><summary><code>client.users.<a href="src/seed/users/client.py">list_with_offset_pagination_has_next_page</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_offset_pagination_has_next_page(
    page=1,
    limit=1,
    order="asc",
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page

```
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

<details><summary><code>client.users.<a href="src/seed/users/client.py">list_with_extended_results</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import uuid

from seed import SeedPagination

client = SeedPagination(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_extended_results(
    cursor=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page

```
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

<details><summary><code>client.users.<a href="src/seed/users/client.py">list_with_extended_results_and_optional_data</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import uuid

from seed import SeedPagination

client = SeedPagination(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_extended_results_and_optional_data(
    cursor=uuid.UUID(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ),
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page

```
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

<details><summary><code>client.users.<a href="src/seed/users/client.py">list_usernames</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_usernames(
    starting_after="starting_after",
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page

```
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

<details><summary><code>client.users.<a href="src/seed/users/client.py">list_usernames_custom</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
client.users.list_usernames_custom(
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

<details><summary><code>client.users.<a href="src/seed/users/client.py">list_with_global_config</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_global_config(
    offset=1,
)
for item in response:
    yield item
# alternatively, you can paginate page-by-page
for page in response.iter_pages():
    yield page

```
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

