# Reference
## User
<details><summary><code>client.user.<a href="src/seed/user/client.py">get_username</a>(...) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedQueryParameters
import uuid
import datetime
from seed.user import User, NestedUser

client = SeedQueryParameters(
    base_url="https://yourhost.com/path/to/api",
)

client.user.get_username(
    limit=1,
    id=uuid.UUID("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
    date=datetime.date.fromisoformat("2023-01-15"),
    deadline=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    bytes="SGVsbG8gd29ybGQh",
    user=User(
        name="name",
        tags=[
            "tags",
            "tags"
        ],
    ),
    user_list=[
        User(
            name="name",
            tags=[
                "tags",
                "tags"
            ],
        ),
        User(
            name="name",
            tags=[
                "tags",
                "tags"
            ],
        )
    ],
    optional_deadline=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    key_value={
        "keyValue": "keyValue"
    },
    optional_string="optionalString",
    nested_user=NestedUser(
        name="name",
        user=User(
            name="name",
            tags=[
                "tags",
                "tags"
            ],
        ),
    ),
    optional_user=User(
        name="name",
        tags=[
            "tags",
            "tags"
        ],
    ),
    exclude_user=[
        User(
            name="name",
            tags=[
                "tags",
                "tags"
            ],
        )
    ],
    filter=[
        "filter"
    ],
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

**limit:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `uuid.UUID` 
    
</dd>
</dl>

<dl>
<dd>

**date:** `datetime.date` 
    
</dd>
</dl>

<dl>
<dd>

**deadline:** `datetime.datetime` 
    
</dd>
</dl>

<dl>
<dd>

**bytes:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**user:** `User` 
    
</dd>
</dl>

<dl>
<dd>

**user_list:** `typing.List[User]` 
    
</dd>
</dl>

<dl>
<dd>

**key_value:** `typing.Dict[str, str]` 
    
</dd>
</dl>

<dl>
<dd>

**nested_user:** `NestedUser` 
    
</dd>
</dl>

<dl>
<dd>

**exclude_user:** `typing.Union[User, typing.Sequence[User]]` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `typing.Union[str, typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_deadline:** `typing.Optional[datetime.datetime]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_string:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_user:** `typing.Optional[User]` 
    
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

