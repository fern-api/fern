# Reference
## Users
<details><summary><code>client.users.<a href="src/seed/users/client.py">list_with_uri_pagination</a>() -&gt; AsyncPager[User, ListUsersUriPaginationResponse]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPaginationUriPath

client = SeedPaginationUriPath(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_uri_pagination()
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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.users.<a href="src/seed/users/client.py">list_with_path_pagination</a>() -&gt; AsyncPager[User, ListUsersPathPaginationResponse]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedPaginationUriPath

client = SeedPaginationUriPath(
    token="YOUR_TOKEN",
    base_url="https://yourhost.com/path/to/api",
)
response = client.users.list_with_path_pagination()
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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

