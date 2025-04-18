```python
from seed import SeedSingleUrlEnvironmentNoDefault
from seed.environment import SeedSingleUrlEnvironmentNoDefaultEnvironment

client = SeedSingleUrlEnvironmentNoDefault(environment=SeedSingleUrlEnvironmentNoDefaultEnvironment.PRODUCTION, token="YOUR_TOKEN", )        
client.dummy.get_dummy(
	
)

```


