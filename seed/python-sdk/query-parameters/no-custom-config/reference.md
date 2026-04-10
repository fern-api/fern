# Reference
## User
<details><summary><code>client.user.<a href="src/seed/user/client.py">getusername</a>(...) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, User, NestedUser
import datetime

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.user.getusername(
    limit=1,
    id="id",
    date=datetime.date.fromisoformat("2023-01-15"),
    deadline=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
    bytes="bytes",
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

**id:** `str` 
    
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

**user_list:** `typing.Optional[typing.Union[User, typing.Sequence[User]]]` 
    
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

**exclude_user:** `typing.Optional[typing.Union[User, typing.Sequence[User]]]` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `typing.Optional[typing.Union[str, typing.Sequence[str]]]` 
    
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

