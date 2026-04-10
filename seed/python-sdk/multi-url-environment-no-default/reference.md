# Reference
## Ec2
<details><summary><code>client.ec2.<a href="src/seed/ec2/client.py">boot_instance</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedMultiUrlEnvironmentNoDefault
from seed.environment import SeedMultiUrlEnvironmentNoDefaultEnvironment

client = SeedMultiUrlEnvironmentNoDefault(
    token="<token>",
    environment=SeedMultiUrlEnvironmentNoDefaultEnvironment.PRODUCTION,
)

client.ec2.boot_instance(
    size="size",
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

**size:** `str` 
    
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

## S3
<details><summary><code>client.s3.<a href="src/seed/s3/client.py">get_presigned_url</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedMultiUrlEnvironmentNoDefault
from seed.environment import SeedMultiUrlEnvironmentNoDefaultEnvironment

client = SeedMultiUrlEnvironmentNoDefault(
    token="<token>",
    environment=SeedMultiUrlEnvironmentNoDefaultEnvironment.PRODUCTION,
)

client.s3.get_presigned_url(
    s3key="s3Key",
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

**s3key:** `str` 
    
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

