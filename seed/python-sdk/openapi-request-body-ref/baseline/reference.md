# Reference
## Vendor
<details><summary><code>client.vendor.<a href="src/seed/vendor/client.py">update_vendor</a>(...) -> Vendor</code></summary>
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

client.vendor.update_vendor(
    vendor_id="vendor_id",
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

**vendor_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `UpdateVendorRequest` 
    
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

<details><summary><code>client.vendor.<a href="src/seed/vendor/client.py">create_vendor</a>(...) -> Vendor</code></summary>
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

client.vendor.create_vendor(
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

**name:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**address:** `typing.Optional[str]` 
    
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

## Catalog
<details><summary><code>client.catalog.<a href="src/seed/catalog/client.py">create_catalog_image</a>(...) -> CatalogImage</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, CreateCatalogImageRequest

client = SeedApi(
    base_url="https://yourhost.com/path/to/api",
)

client.catalog.create_catalog_image(
    image_file="example_image_file",
    request=CreateCatalogImageRequest(
        catalog_object_id="catalog_object_id",
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

**request:** `CreateCatalogImageRequest` 
    
</dd>
</dl>

<dl>
<dd>

**image_file:** `typing.Optional[core.File]` 
    
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

<details><summary><code>client.catalog.<a href="src/seed/catalog/client.py">get_catalog_image</a>(...) -> CatalogImage</code></summary>
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

client.catalog.get_catalog_image(
    image_id="image_id",
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

**image_id:** `str` 
    
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

## TeamMember
<details><summary><code>client.team_member.<a href="src/seed/team_member/client.py">update_team_member</a>(...) -> TeamMember</code></summary>
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

client.team_member.update_team_member(
    team_member_id="team_member_id",
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

**team_member_id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**given_name:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**family_name:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**email_address:** `typing.Optional[str]` 
    
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

