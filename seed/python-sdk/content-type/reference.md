# Reference
## Service
<details><summary><code>client.service.<a href="src/seed/service/client.py">patch</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedContentTypes

client = SeedContentTypes(
    base_url="https://yourhost.com/path/to/api",
)
client.service.patch(
    application="application",
    require_auth=True,
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

**application:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**require_auth:** `typing.Optional[bool]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">patch_complex</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update with JSON merge patch - complex types.
This endpoint demonstrates the distinction between:
- optional<T> fields (can be present or absent, but not null)
- optional<nullable<T>> fields (can be present, absent, or null)
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
from seed import SeedContentTypes

client = SeedContentTypes(
    base_url="https://yourhost.com/path/to/api",
)
client.service.patch_complex(
    id="id",
    name="name",
    age=1,
    active=True,
    metadata={"metadata": {"key": "value"}},
    tags=["tags", "tags"],
    email="email",
    nickname="nickname",
    bio="bio",
    profile_image_url="profileImageUrl",
    settings={"settings": {"key": "value"}},
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

**name:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**age:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**active:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `typing.Optional[typing.Dict[str, typing.Any]]` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `typing.Optional[typing.Sequence[str]]` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**nickname:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**bio:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**profile_image_url:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**settings:** `typing.Optional[typing.Dict[str, typing.Any]]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">named_patch_with_mixed</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Named request with mixed optional/nullable fields and merge-patch content type.
This should trigger the NPE issue when optional fields aren't initialized.
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
from seed import SeedContentTypes

client = SeedContentTypes(
    base_url="https://yourhost.com/path/to/api",
)
client.service.named_patch_with_mixed(
    id="id",
    app_id="appId",
    instructions="instructions",
    active=True,
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

**app_id:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**instructions:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**active:** `typing.Optional[bool]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">optional_merge_patch_test</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
This endpoint should:
1. Not NPE when fields are not provided (tests initialization)
2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
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
from seed import SeedContentTypes

client = SeedContentTypes(
    base_url="https://yourhost.com/path/to/api",
)
client.service.optional_merge_patch_test(
    required_field="requiredField",
    optional_string="optionalString",
    optional_integer=1,
    optional_boolean=True,
    nullable_string="nullableString",
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

**required_field:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**optional_string:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_integer:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_boolean:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_string:** `typing.Optional[str]` 
    
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

<details><summary><code>client.service.<a href="src/seed/service/client.py">regular_patch</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Regular PATCH endpoint without merge-patch semantics
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
from seed import SeedContentTypes

client = SeedContentTypes(
    base_url="https://yourhost.com/path/to/api",
)
client.service.regular_patch(
    id="id",
    field_1="field1",
    field_2=1,
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

**field_1:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**field_2:** `typing.Optional[int]` 
    
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

