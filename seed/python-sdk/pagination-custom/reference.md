# Reference
## Users
<details><summary><code>client.users.<a href="src/seed/users/client.py">listwithcustompager</a>(...) -> UsersListResponse</code></summary>
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

client.users.listwithcustompager()

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

**limit:** `typing.Optional[int]` — The maximum number of results to return.
    
</dd>
</dl>

<dl>
<dd>

**starting_after:** `typing.Optional[str]` — The cursor used for pagination.
    
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

