# Reference
## Ec2
<details><summary><code>client.ec_2.<a href="src/seed/ec_2/client.py">boot_instance</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
    environment=SeedMultiUrlEnvironmentNoDefaultEnvironment.PRODUCTION,
)
client.ec_2.boot_instance(
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
<details><summary><code>client.s_3.<a href="src/seed/s_3/client.py">get_presigned_url</a>(...)</code></summary>
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
    token="YOUR_TOKEN",
    environment=SeedMultiUrlEnvironmentNoDefaultEnvironment.PRODUCTION,
)
client.s_3.get_presigned_url(
    s_3_key="s3Key",
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

**s_3_key:** `str` 
    
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

