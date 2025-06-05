```python
from seed import SeedMultiUrlEnvironment

client = SeedMultiUrlEnvironment(token="YOUR_TOKEN", )        
client.ec_2.boot_instance(
	size="size"
)

```


```python
from seed import SeedMultiUrlEnvironment

client = SeedMultiUrlEnvironment(token="YOUR_TOKEN", )        
client.s_3.get_presigned_url(
	s_3_key="s3Key"
)

```


