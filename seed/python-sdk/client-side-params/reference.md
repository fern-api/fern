# Reference
## Service
<details><summary><code>client.service.<a href="src/seed/service/client.py">list_resources</a>(...) -> typing.List[Resource]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List resources with pagination
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedClientSideParams

client = SeedClientSideParams(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.service.list_resources(
    page=1,
    per_page=1,
    sort="created_at",
    order="desc",
    include_totals=True,
    fields="fields",
    search="search",
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

**page:** `int` — Zero-indexed page number
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `int` — Number of items per page
    
</dd>
</dl>

<dl>
<dd>

**sort:** `str` — Sort field
    
</dd>
</dl>

<dl>
<dd>

**order:** `str` — Sort order (asc or desc)
    
</dd>
</dl>

<dl>
<dd>

**include_totals:** `bool` — Whether to include total count
    
</dd>
</dl>

<dl>
<dd>

**fields:** `typing.Optional[str]` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**search:** `typing.Optional[str]` — Search query
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">get_resource</a>(...) -> Resource</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a single resource
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedClientSideParams

client = SeedClientSideParams(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.service.get_resource(
    resource_id="resourceId",
    include_metadata=True,
    format="json",
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

**resource_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**include_metadata:** `bool` — Include metadata in response
    
</dd>
</dl>

<dl>
<dd>

**format:** `str` — Response format
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">search_resources</a>(...) -> SearchResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search resources with complex parameters
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedClientSideParams

client = SeedClientSideParams(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.service.search_resources(
    limit=1,
    offset=1,
    query="query",
    filters={
        "filters": {"key": "value"}
    },
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

**limit:** `int` — Maximum results to return
    
</dd>
</dl>

<dl>
<dd>

**offset:** `int` — Offset for pagination
    
</dd>
</dl>

<dl>
<dd>

**query:** `typing.Optional[str]` — Search query text
    
</dd>
</dl>

<dl>
<dd>

**filters:** `typing.Optional[typing.Dict[str, typing.Any]]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">list_users</a>(...) -> PaginatedUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List or search for users
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedClientSideParams

client = SeedClientSideParams(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.service.list_users(
    page=1,
    per_page=1,
    include_totals=True,
    sort="sort",
    connection="connection",
    q="q",
    search_engine="search_engine",
    fields="fields",
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

**page:** `typing.Optional[int]` — Page index of the results to return. First page is 0.
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `typing.Optional[int]` — Number of results per page.
    
</dd>
</dl>

<dl>
<dd>

**include_totals:** `typing.Optional[bool]` — Return results inside an object that contains the total result count (true) or as a direct array of results (false, default).
    
</dd>
</dl>

<dl>
<dd>

**sort:** `typing.Optional[str]` — Field to sort by. Use field:order where order is 1 for ascending and -1 for descending.
    
</dd>
</dl>

<dl>
<dd>

**connection:** `typing.Optional[str]` — Connection filter
    
</dd>
</dl>

<dl>
<dd>

**q:** `typing.Optional[str]` — Query string following Lucene query string syntax
    
</dd>
</dl>

<dl>
<dd>

**search_engine:** `typing.Optional[str]` — Search engine version (v1, v2, or v3)
    
</dd>
</dl>

<dl>
<dd>

**fields:** `typing.Optional[str]` — Comma-separated list of fields to include or exclude
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">get_user_by_id</a>(...) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a user by ID
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedClientSideParams

client = SeedClientSideParams(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.service.get_user_by_id(
    user_id="userId",
    fields="fields",
    include_fields=True,
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

**user_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `typing.Optional[str]` — Comma-separated list of fields to include or exclude
    
</dd>
</dl>

<dl>
<dd>

**include_fields:** `typing.Optional[bool]` — true to include the fields specified, false to exclude them
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">create_user</a>(...) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new user
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedClientSideParams

client = SeedClientSideParams(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.service.create_user(
    email="email",
    email_verified=True,
    username="username",
    password="password",
    phone_number="phone_number",
    phone_verified=True,
    user_metadata={
        "user_metadata": {"key": "value"}
    },
    app_metadata={
        "app_metadata": {"key": "value"}
    },
    connection="connection",
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

**request:** `CreateUserRequest` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">update_user</a>(...) -> User</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a user
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedClientSideParams

client = SeedClientSideParams(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.service.update_user(
    user_id="userId",
    email="email",
    email_verified=True,
    username="username",
    phone_number="phone_number",
    phone_verified=True,
    user_metadata={
        "user_metadata": {"key": "value"}
    },
    app_metadata={
        "app_metadata": {"key": "value"}
    },
    password="password",
    blocked=True,
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

**user_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `UpdateUserRequest` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">delete_user</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a user
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedClientSideParams

client = SeedClientSideParams(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.service.delete_user(
    user_id="userId",
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

**user_id:** `str` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">list_connections</a>(...) -> typing.List[Connection]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all connections
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedClientSideParams

client = SeedClientSideParams(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.service.list_connections(
    strategy="strategy",
    name="name",
    fields="fields",
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

**strategy:** `typing.Optional[str]` — Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    
</dd>
</dl>

<dl>
<dd>

**name:** `typing.Optional[str]` — Filter by connection name
    
</dd>
</dl>

<dl>
<dd>

**fields:** `typing.Optional[str]` — Comma-separated list of fields to include
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">get_connection</a>(...) -> Connection</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a connection by ID
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedClientSideParams

client = SeedClientSideParams(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.service.get_connection(
    connection_id="connectionId",
    fields="fields",
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

**connection_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `typing.Optional[str]` — Comma-separated list of fields to include
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">list_clients</a>(...) -> PaginatedClientResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all clients/applications
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedClientSideParams

client = SeedClientSideParams(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.service.list_clients(
    fields="fields",
    include_fields=True,
    page=1,
    per_page=1,
    include_totals=True,
    is_global=True,
    is_first_party=True,
    app_type=[
        "app_type",
        "app_type"
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

**fields:** `typing.Optional[str]` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**include_fields:** `typing.Optional[bool]` — Whether specified fields are included or excluded
    
</dd>
</dl>

<dl>
<dd>

**page:** `typing.Optional[int]` — Page number (zero-based)
    
</dd>
</dl>

<dl>
<dd>

**per_page:** `typing.Optional[int]` — Number of results per page
    
</dd>
</dl>

<dl>
<dd>

**include_totals:** `typing.Optional[bool]` — Include total count in response
    
</dd>
</dl>

<dl>
<dd>

**is_global:** `typing.Optional[bool]` — Filter by global clients
    
</dd>
</dl>

<dl>
<dd>

**is_first_party:** `typing.Optional[bool]` — Filter by first party clients
    
</dd>
</dl>

<dl>
<dd>

**app_type:** `typing.Optional[typing.List[str]]` — Filter by application type (spa, native, regular_web, non_interactive)
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">get_client</a>(...) -> Client</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a client by ID
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedClientSideParams

client = SeedClientSideParams(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.service.get_client(
    client_id="clientId",
    fields="fields",
    include_fields=True,
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

**client_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**fields:** `typing.Optional[str]` — Comma-separated list of fields to include
    
</dd>
</dl>

<dl>
<dd>

**include_fields:** `typing.Optional[bool]` — Whether specified fields are included or excluded
    
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

