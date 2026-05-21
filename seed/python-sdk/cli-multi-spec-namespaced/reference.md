# Reference
## V1
<details><summary><code>client.v1.<a href="src/seed/v1/client.py">list_users</a>() -> typing.List[UserV1]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    api_key="<X-Api-Key>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.v1.list_users()

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

## V2
<details><summary><code>client.v2.<a href="src/seed/v2/client.py">list_users</a>(...) -> typing.List[UserV2]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    token="<token>",
    api_key="<X-Api-Key>",
    environment=SeedApiEnvironment.DEFAULT,
)

client.v1.list_users()

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

**page_size:** `typing.Optional[int]` 
    
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

