# Reference
## NullableOptional
<details><summary><code>client.nullable_optional.<a href="src/seed/nullable_optional/client.py">get_user</a>(...) -&gt; AsyncHttpResponse[UserResponse]</code></summary>
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
from seed import SeedNullableOptional

client = SeedNullableOptional(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable_optional.get_user(
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

<details><summary><code>client.nullable_optional.<a href="src/seed/nullable_optional/client.py">create_user</a>(...) -&gt; AsyncHttpResponse[UserResponse]</code></summary>
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
from seed import SeedNullableOptional
from seed.nullable_optional import Address

client = SeedNullableOptional(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable_optional.create_user(
    username="username",
    email="email",
    phone="phone",
    address=Address(
        street="street",
        city="city",
        state="state",
        zip_code="zipCode",
        country="country",
        building_id="buildingId",
        tenant_id="tenantId",
    ),
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

**email:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**phone:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**address:** `typing.Optional[Address]` 
    
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

<details><summary><code>client.nullable_optional.<a href="src/seed/nullable_optional/client.py">update_user</a>(...) -&gt; AsyncHttpResponse[UserResponse]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a user (partial update)
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
from seed import SeedNullableOptional
from seed.nullable_optional import Address

client = SeedNullableOptional(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable_optional.update_user(
    user_id="userId",
    username="username",
    email="email",
    phone="phone",
    address=Address(
        street="street",
        city="city",
        state="state",
        zip_code="zipCode",
        country="country",
        building_id="buildingId",
        tenant_id="tenantId",
    ),
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

**username:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**phone:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**address:** `typing.Optional[Address]` 
    
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

<details><summary><code>client.nullable_optional.<a href="src/seed/nullable_optional/client.py">list_users</a>(...) -&gt; AsyncHttpResponse[typing.List[UserResponse]]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List all users
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
from seed import SeedNullableOptional

client = SeedNullableOptional(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable_optional.list_users(
    limit=1,
    offset=1,
    include_deleted=True,
    sort_by="sortBy",
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

**limit:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**offset:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**include_deleted:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` 
    
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

<details><summary><code>client.nullable_optional.<a href="src/seed/nullable_optional/client.py">search_users</a>(...) -&gt; AsyncHttpResponse[typing.List[UserResponse]]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search users
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
from seed import SeedNullableOptional

client = SeedNullableOptional(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable_optional.search_users(
    query="query",
    department="department",
    role="role",
    is_active=True,
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

**query:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**department:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**role:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**is_active:** `typing.Optional[bool]` 
    
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

<details><summary><code>client.nullable_optional.<a href="src/seed/nullable_optional/client.py">create_complex_profile</a>(...) -&gt; AsyncHttpResponse[ComplexProfile]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a complex profile to test nullable enums and unions
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
import datetime

from seed import SeedNullableOptional
from seed.nullable_optional import (
    Address,
    NotificationMethod_Email,
    SearchResult_User,
)

client = SeedNullableOptional(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable_optional.create_complex_profile(
    id="id",
    nullable_role="ADMIN",
    optional_role="ADMIN",
    optional_nullable_role="ADMIN",
    nullable_status="active",
    optional_status="active",
    optional_nullable_status="active",
    nullable_notification=NotificationMethod_Email(
        email_address="emailAddress",
        subject="subject",
        html_content="htmlContent",
    ),
    optional_notification=NotificationMethod_Email(
        email_address="emailAddress",
        subject="subject",
        html_content="htmlContent",
    ),
    optional_nullable_notification=NotificationMethod_Email(
        email_address="emailAddress",
        subject="subject",
        html_content="htmlContent",
    ),
    nullable_search_result=SearchResult_User(
        id="id",
        username="username",
        email="email",
        phone="phone",
        created_at=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        updated_at=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        address=Address(
            street="street",
            city="city",
            state="state",
            zip_code="zipCode",
            country="country",
            building_id="buildingId",
            tenant_id="tenantId",
        ),
    ),
    optional_search_result=SearchResult_User(
        id="id",
        username="username",
        email="email",
        phone="phone",
        created_at=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        updated_at=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        address=Address(
            street="street",
            city="city",
            state="state",
            zip_code="zipCode",
            country="country",
            building_id="buildingId",
            tenant_id="tenantId",
        ),
    ),
    nullable_array=["nullableArray", "nullableArray"],
    optional_array=["optionalArray", "optionalArray"],
    optional_nullable_array=["optionalNullableArray", "optionalNullableArray"],
    nullable_list_of_nullables=[
        "nullableListOfNullables",
        "nullableListOfNullables",
    ],
    nullable_map_of_nullables={
        "nullableMapOfNullables": Address(
            street="street",
            city="city",
            state="state",
            zip_code="zipCode",
            country="country",
            building_id="buildingId",
            tenant_id="tenantId",
        )
    },
    nullable_list_of_unions=[
        NotificationMethod_Email(
            email_address="emailAddress",
            subject="subject",
            html_content="htmlContent",
        ),
        NotificationMethod_Email(
            email_address="emailAddress",
            subject="subject",
            html_content="htmlContent",
        ),
    ],
    optional_map_of_enums={"optionalMapOfEnums": "ADMIN"},
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

**nullable_role:** `typing.Optional[UserRole]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_role:** `typing.Optional[UserRole]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_nullable_role:** `typing.Optional[UserRole]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_status:** `typing.Optional[UserStatus]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_status:** `typing.Optional[UserStatus]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_nullable_status:** `typing.Optional[UserStatus]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_notification:** `typing.Optional[NotificationMethod]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_notification:** `typing.Optional[NotificationMethod]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_nullable_notification:** `typing.Optional[NotificationMethod]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_search_result:** `typing.Optional[SearchResult]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_search_result:** `typing.Optional[SearchResult]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_array:** `typing.Optional[typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_array:** `typing.Optional[typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_nullable_array:** `typing.Optional[typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_list_of_nullables:** `typing.Optional[typing.Sequence[typing.Optional[str]]]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_map_of_nullables:** `typing.Optional[typing.Dict[str, typing.Optional[Address]]]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_list_of_unions:** `typing.Optional[typing.Sequence[NotificationMethod]]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_map_of_enums:** `typing.Optional[typing.Dict[str, UserRole]]` 
    
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

<details><summary><code>client.nullable_optional.<a href="src/seed/nullable_optional/client.py">get_complex_profile</a>(...) -&gt; AsyncHttpResponse[ComplexProfile]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a complex profile by ID
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
from seed import SeedNullableOptional

client = SeedNullableOptional(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable_optional.get_complex_profile(
    profile_id="profileId",
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

**profile_id:** `str` 
    
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

<details><summary><code>client.nullable_optional.<a href="src/seed/nullable_optional/client.py">update_complex_profile</a>(...) -&gt; AsyncHttpResponse[ComplexProfile]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update complex profile to test nullable field updates
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
import datetime

from seed import SeedNullableOptional
from seed.nullable_optional import (
    Address,
    NotificationMethod_Email,
    SearchResult_User,
)

client = SeedNullableOptional(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable_optional.update_complex_profile(
    profile_id="profileId",
    nullable_role="ADMIN",
    nullable_status="active",
    nullable_notification=NotificationMethod_Email(
        email_address="emailAddress",
        subject="subject",
        html_content="htmlContent",
    ),
    nullable_search_result=SearchResult_User(
        id="id",
        username="username",
        email="email",
        phone="phone",
        created_at=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        updated_at=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        address=Address(
            street="street",
            city="city",
            state="state",
            zip_code="zipCode",
            country="country",
            building_id="buildingId",
            tenant_id="tenantId",
        ),
    ),
    nullable_array=["nullableArray", "nullableArray"],
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

**profile_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_role:** `typing.Optional[UserRole]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_status:** `typing.Optional[UserStatus]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_notification:** `typing.Optional[NotificationMethod]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_search_result:** `typing.Optional[SearchResult]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_array:** `typing.Optional[typing.Sequence[str]]` 
    
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

<details><summary><code>client.nullable_optional.<a href="src/seed/nullable_optional/client.py">test_deserialization</a>(...) -&gt; AsyncHttpResponse[DeserializationTestResponse]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint for validating null deserialization
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
import datetime

from seed import SeedNullableOptional
from seed.nullable_optional import (
    Address,
    NotificationMethod_Email,
    Organization,
    SearchResult_User,
)

client = SeedNullableOptional(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable_optional.test_deserialization(
    required_string="requiredString",
    nullable_string="nullableString",
    optional_string="optionalString",
    optional_nullable_string="optionalNullableString",
    nullable_enum="ADMIN",
    optional_enum="active",
    nullable_union=NotificationMethod_Email(
        email_address="emailAddress",
        subject="subject",
        html_content="htmlContent",
    ),
    optional_union=SearchResult_User(
        id="id",
        username="username",
        email="email",
        phone="phone",
        created_at=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        updated_at=datetime.datetime.fromisoformat(
            "2024-01-15 09:30:00+00:00",
        ),
        address=Address(
            street="street",
            city="city",
            state="state",
            zip_code="zipCode",
            country="country",
            building_id="buildingId",
            tenant_id="tenantId",
        ),
    ),
    nullable_list=["nullableList", "nullableList"],
    nullable_map={"nullableMap": 1},
    nullable_object=Address(
        street="street",
        city="city",
        state="state",
        zip_code="zipCode",
        country="country",
        building_id="buildingId",
        tenant_id="tenantId",
    ),
    optional_object=Organization(
        id="id",
        name="name",
        domain="domain",
        employee_count=1,
    ),
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

**required_string:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_string:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_string:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_nullable_string:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_enum:** `typing.Optional[UserRole]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_enum:** `typing.Optional[UserStatus]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_union:** `typing.Optional[NotificationMethod]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_union:** `typing.Optional[SearchResult]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_list:** `typing.Optional[typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_map:** `typing.Optional[typing.Dict[str, int]]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_object:** `typing.Optional[Address]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_object:** `typing.Optional[Organization]` 
    
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

<details><summary><code>client.nullable_optional.<a href="src/seed/nullable_optional/client.py">filter_by_role</a>(...) -&gt; AsyncHttpResponse[typing.List[UserResponse]]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Filter users by role with nullable enum
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
from seed import SeedNullableOptional

client = SeedNullableOptional(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable_optional.filter_by_role(
    role="ADMIN",
    status="active",
    secondary_role="ADMIN",
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

**role:** `typing.Optional[UserRole]` 
    
</dd>
</dl>

<dl>
<dd>

**status:** `typing.Optional[UserStatus]` 
    
</dd>
</dl>

<dl>
<dd>

**secondary_role:** `typing.Optional[UserRole]` 
    
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

<details><summary><code>client.nullable_optional.<a href="src/seed/nullable_optional/client.py">get_notification_settings</a>(...) -&gt; AsyncHttpResponse[typing.Optional[NotificationMethod]]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get notification settings which may be null
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
from seed import SeedNullableOptional

client = SeedNullableOptional(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable_optional.get_notification_settings(
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

<details><summary><code>client.nullable_optional.<a href="src/seed/nullable_optional/client.py">update_tags</a>(...) -&gt; AsyncHttpResponse[typing.List[str]]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update tags to test array handling
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
from seed import SeedNullableOptional

client = SeedNullableOptional(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable_optional.update_tags(
    user_id="userId",
    tags=["tags", "tags"],
    categories=["categories", "categories"],
    labels=["labels", "labels"],
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

**tags:** `typing.Optional[typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**categories:** `typing.Optional[typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**labels:** `typing.Optional[typing.Sequence[str]]` 
    
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

<details><summary><code>client.nullable_optional.<a href="src/seed/nullable_optional/client.py">get_search_results</a>(...) -&gt; AsyncHttpResponse[typing.Optional[typing.List[SearchResult]]]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get search results with nullable unions
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
from seed import SeedNullableOptional

client = SeedNullableOptional(
    base_url="https://yourhost.com/path/to/api",
)
client.nullable_optional.get_search_results(
    query="query",
    filters={"filters": "filters"},
    include_types=["includeTypes", "includeTypes"],
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

**query:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**filters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 
    
</dd>
</dl>

<dl>
<dd>

**include_types:** `typing.Optional[typing.Sequence[str]]` 
    
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

