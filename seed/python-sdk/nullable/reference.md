# Reference
## Nullable
<details><summary><code>client.nullable.<a href="src/seed/nullable/client.py">get_users</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedNullable

client = SeedNullable(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable.get_users(
    usernames="usernames",
    avatar="avatar",
    activated=True,
    tags="tags",
    extra=True,
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

**usernames:** `typing.Optional[typing.Union[str, typing.Sequence[str]]]` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**activated:** `typing.Optional[typing.Union[bool, typing.Sequence[bool]]]` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `typing.Optional[typing.Union[str, typing.Sequence[str]]]` 
    
</dd>
</dl>

<dl>
<dd>

**extra:** `typing.Optional[bool]` 
    
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

<details><summary><code>client.nullable.<a href="src/seed/nullable/client.py">create_user</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
import datetime

from seed import SeedNullable
from seed.nullable import Metadata

client = SeedNullable(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable.create_user(
    username="username",
    tags=["tags", "tags"],
    metadata=Metadata(
        created_at=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        updated_at=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        avatar="avatar",
        activated=True,
    ),
    avatar="avatar",
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

**username:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `typing.Optional[typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `typing.Optional[Metadata]` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `typing.Optional[str]` 
    
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

<details><summary><code>client.nullable.<a href="src/seed/nullable/client.py">delete_user</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedNullable

client = SeedNullable(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable.delete_user(
    username="xy",
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

**username:** `typing.Optional[str]` — The user to delete.
    
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

