# Reference
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
response = client.users.list_with_cursor_pagination()
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

client = SeedPagination(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_body_cursor_pagination()
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
response = client.users.list_with_offset_pagination()
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

client = SeedPagination(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_body_offset_pagination()
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
response = client.users.list_with_offset_step_pagination()
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

The maxiumum number of elements to return.
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
response = client.users.list_with_offset_pagination_has_next_page()
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

The maxiumum number of elements to return.
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
from seed import SeedPagination

client = SeedPagination(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_extended_results()
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
from seed import SeedPagination

client = SeedPagination(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_extended_results_and_optional_data()
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
response = client.users.list_usernames()
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
response = client.users.list_with_global_config()
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

