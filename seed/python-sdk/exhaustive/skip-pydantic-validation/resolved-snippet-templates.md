```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.container.get_and_return_set_of_primitives(
	
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.container.get_and_return_set_of_objects(
	
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.container.get_and_return_map_prim_to_prim(
	request={
		"jsonExample": {"string":"string"},
		"shape": {"container":{"map":[{"key":{"jsonExample":"string","shape":{"primitive":{"string":{"original":"string"},"type":"string"},"type":"primitive"}},"value":{"jsonExample":"string","shape":{"primitive":{"string":{"original":"string"},"type":"string"},"type":"primitive"}}}],"keyType":{"primitive":{"v1":"STRING","v2":{"type":"string"}},"type":"primitive"},"valueType":{"primitive":{"v1":"STRING","v2":{"type":"string"}},"type":"primitive"},"type":"map"},"type":"container"},
		"type": "reference",
		"_visit": 
	}
)
 
```                        


```python
from seed import SeedExhaustive
from seed.types.object import ObjectWithRequiredField

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.container.get_and_return_map_of_prim_to_object(
	request={
		"jsonExample": ObjectWithRequiredField(
			string={"string":"string"}
		)
	}
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.http_methods.test_get(
	id="string"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.http_methods.test_put(
	id="string"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.http_methods.test_patch(
	id="string"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.http_methods.test_delete(
	id="string"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.object.get_and_return_nested_with_required_field(
	string="string"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.params.get_with_path(
	param="string"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.params.get_with_query(
	query="string",
	number=1
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.params.get_with_allow_multiple_query(
	query="string",
	numer=1
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.params.get_with_path_and_query(
	param="string",
	query="string"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.params.modify_with_path(
	param="string",
	request={"jsonExample":"string","shape":{"primitive":{"string":{"original":"string"},"type":"string"},"type":"primitive"},"type":"reference"}
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_string(
	request={"jsonExample":"string","shape":{"primitive":{"string":{"original":"string"},"type":"string"},"type":"primitive"},"type":"reference"}
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_int(
	request={"jsonExample":1,"shape":{"primitive":{"integer":1,"type":"integer"},"type":"primitive"},"type":"reference"}
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_long(
	request={"jsonExample":1000000,"shape":{"primitive":{"long":1000000,"type":"long"},"type":"primitive"},"type":"reference"}
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_double(
	request={"jsonExample":1.1,"shape":{"primitive":{"double":1.1,"type":"double"},"type":"primitive"},"type":"reference"}
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_bool(
	request={"jsonExample":true,"shape":{"primitive":{"boolean":true,"type":"boolean"},"type":"primitive"},"type":"reference"}
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_datetime(
	request={"jsonExample":"2024-01-15T09:30:00Z","shape":{"primitive":{"datetime":"2024-01-15T09:30:00.000Z","raw":"2024-01-15T09:30:00Z","type":"datetime"},"type":"primitive"},"type":"reference"}
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_date(
	request={"jsonExample":"2023-01-15","shape":{"primitive":{"date":"2023-01-15","type":"date"},"type":"primitive"},"type":"reference"}
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_uuid(
	request={"jsonExample":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","shape":{"primitive":{"uuid":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","type":"uuid"},"type":"primitive"},"type":"reference"}
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_base_64(
	request={"jsonExample":"SGVsbG8gd29ybGQh","shape":{"primitive":{"string":{"original":"SGVsbG8gd29ybGQh"},"type":"string"},"type":"primitive"},"type":"reference"}
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
undefined
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.no_auth.post_with_no_auth(
	request={"jsonExample":{"key":"value"},"shape":{"unknown":{"key":"value"},"type":"unknown"},"type":"reference"}
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.no_auth.post_with_no_auth(
	request={"jsonExample":{"key":"value"},"shape":{"unknown":{"key":"value"},"type":"unknown"},"type":"reference"}
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.no_req_body.get_with_no_request_body(
	
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.no_req_body.post_with_no_request_body(
	
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.req_with_headers.get_with_custom_header(
	x_test_endpoint_header="string",
	request={"jsonExample":"string","shape":{"primitive":{"string":{"original":"string"},"type":"string"},"type":"primitive"},"type":"reference"}
)
 
```                        


