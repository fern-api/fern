# Reference
## User
<details><summary><code>client.user.<a href="src/seed/user/client.py">get</a>(...) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedSimpleApi
from seed.environment import SeedSimpleApiEnvironment

client = SeedSimpleApi(
    token="<token>",
    environment=SeedSimpleApiEnvironment.PRODUCTION,
)

client.user.get(
    id="id",
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

**id:** `str` 
    
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

