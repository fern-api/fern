# Reference
## User
<details><summary><code>client.user.<a href="src/seed/user/client.py">createusername</a>(...)</code></summary>
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
    base_url="https://yourhost.com/path/to/api",
)

client.user.createusername(
    tags=[
        "tags"
    ],
    username="username",
    password="password",
    name="name",
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

**password:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `typing.Optional[typing.Union[str, typing.Sequence[str]]]` 
    
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

<details><summary><code>client.user.<a href="src/seed/user/client.py">createusernamewithreferencedtype</a>(...)</code></summary>
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
    base_url="https://yourhost.com/path/to/api",
)

client.user.createusernamewithreferencedtype(
    tags=[
        "tags"
    ],
    username="username",
    password="password",
    name="name",
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

**password:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `typing.Optional[typing.Union[str, typing.Sequence[str]]]` 
    
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

<details><summary><code>client.user.<a href="src/seed/user/client.py">createusernameoptional</a>(...)</code></summary>
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
    base_url="https://yourhost.com/path/to/api",
)

client.user.createusernameoptional()

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

**username:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `typing.Optional[str]` 
    
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
    long_param=1000000,
    big_int_param=1,
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

**long_param:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**big_int_param:** `int` 
    
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

