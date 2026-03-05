# Reference
## Users
<details><summary><code>client.users.<a href="src/seed/users/client.py">list_usernames_custom</a>(...) -> UsernameCursor</code></summary>
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

