```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.container.get_and_return_list_of_primitives(
	request=[
		"string",
		"string"
	]
)
 
```                        


```python
from seed import SeedExhaustive
from seed.types.object import ObjectWithRequiredField

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.container.get_and_return_list_of_objects(
	request=[
		ObjectWithRequiredField(
			string="string"
		),
		ObjectWithRequiredField(
			string="string"
		)
	]
)
 
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
		"string": "string"
	}
)
 
```                        


```python
from seed import SeedExhaustive
from seed.types.object import ObjectWithRequiredField

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.container.get_and_return_map_of_prim_to_object(
	request={
		"string": ObjectWithRequiredField(
			string="string"
		)
	}
)
 
```                        


```python
from seed import SeedExhaustive
from seed.types.object import ObjectWithRequiredField

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.container.get_and_return_optional(
	request=ObjectWithRequiredField(
		string="string"
	)
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.content_type.post_json_patch_content_type(
	string="string",
	integer=1,
	long_=1000000,
	double=1.1,
	bool_=true,
	datetime="2024-01-15T09:30:00Z",
	date="2023-01-15",
	uuid_="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	base_64="SGVsbG8gd29ybGQh",
	list_=[
		"list",
		"list"
	],
	map_={
		"1": "map"
	},
	bigint="1000000"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.content_type.post_json_patch_content_with_charset_type(
	string="string",
	integer=1,
	long_=1000000,
	double=1.1,
	bool_=true,
	datetime="2024-01-15T09:30:00Z",
	date="2023-01-15",
	uuid_="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	base_64="SGVsbG8gd29ybGQh",
	list_=[
		"list",
		"list"
	],
	map_={
		"1": "map"
	},
	bigint="1000000"
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
client.endpoints.http_methods.test_get(
	id="id"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.http_methods.test_post(
	string="string"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.http_methods.test_put(
	id="id",
	string="string"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.http_methods.test_patch(
	id="id",
	string="string",
	integer=1,
	long_=1000000,
	double=1.1,
	bool_=true,
	datetime="2024-01-15T09:30:00Z",
	date="2023-01-15",
	uuid_="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	base_64="SGVsbG8gd29ybGQh",
	list_=[
		"list",
		"list"
	],
	map_={
		"1": "map"
	},
	bigint="1000000"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.http_methods.test_delete(
	id="id"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.object.get_and_return_with_optional_field(
	string="string",
	integer=1,
	long_=1000000,
	double=1.1,
	bool_=true,
	datetime="2024-01-15T09:30:00Z",
	date="2023-01-15",
	uuid_="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	base_64="SGVsbG8gd29ybGQh",
	list_=[
		"list",
		"list"
	],
	map_={
		"1": "map"
	},
	bigint="1000000"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.object.get_and_return_with_required_field(
	string="string"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.object.get_and_return_with_map_of_map(
	map_={
		"map": {
			"map": "map"
		}
	}
)
 
```                        


```python
from seed import SeedExhaustive
from seed.types.object import ObjectWithOptionalField

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.object.get_and_return_nested_with_optional_field(
	string="string",
	nested_object=ObjectWithOptionalField(
		string="string",
		integer=1,
		long_=1000000,
		double=1.1,
		bool_=true,
		datetime="2024-01-15T09:30:00Z",
		date="2023-01-15",
		uuid_="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
		base_64="SGVsbG8gd29ybGQh",
		list_=[
			"list",
			"list"
		],
		map_={
			"1": "map"
		},
		bigint="1000000"
	)
)
 
```                        


```python
from seed import SeedExhaustive
from seed.types.object import ObjectWithOptionalField

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.object.get_and_return_nested_with_required_field(
	string="string",
	string="string",
	nested_object=ObjectWithOptionalField(
		string="string",
		integer=1,
		long_=1000000,
		double=1.1,
		bool_=true,
		datetime="2024-01-15T09:30:00Z",
		date="2023-01-15",
		uuid_="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
		base_64="SGVsbG8gd29ybGQh",
		list_=[
			"list",
			"list"
		],
		map_={
			"1": "map"
		},
		bigint="1000000"
	)
)
 
```                        


```python
from seed import SeedExhaustive
from seed.types.object import NestedObjectWithRequiredField
from seed.types.object import ObjectWithOptionalField

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.object.get_and_return_nested_with_required_field_as_list(
	request=[
		NestedObjectWithRequiredField(
			string="string",
			nested_object=ObjectWithOptionalField(
				string="string",
				integer=1,
				long_=1000000,
				double=1.1,
				bool_=true,
				datetime="2024-01-15T09:30:00Z",
				date="2023-01-15",
				uuid_="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				base_64="SGVsbG8gd29ybGQh",
				map_={
					"1": "map"
				},
				bigint="1000000"
			)
		),
		NestedObjectWithRequiredField(
			string="string",
			nested_object=ObjectWithOptionalField(
				string="string",
				integer=1,
				long_=1000000,
				double=1.1,
				bool_=true,
				datetime="2024-01-15T09:30:00Z",
				date="2023-01-15",
				uuid_="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
				base_64="SGVsbG8gd29ybGQh",
				map_={
					"1": "map"
				},
				bigint="1000000"
			)
		)
	]
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.params.get_with_path(
	param="param"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.params.get_with_query(
	query="query",
	number=1
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.params.get_with_allow_multiple_query(
	query="query",
	numer=1
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.params.get_with_path_and_query(
	param="param",
	query="query"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.params.modify_with_path(
	param="param",
	request="string"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_string(
	request="string"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_int(
	request=1
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_long(
	request=1000000
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_double(
	request=1.1
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_bool(
	request=true
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_datetime(
	request="2024-01-15T09:30:00Z"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_date(
	request="2023-01-15"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_uuid(
	request="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.primitive.get_and_return_base_64(
	request="SGVsbG8gd29ybGQh"
)
 
```                        


```python
from seed import SeedExhaustive
from seed.types.union import Animal_Dog

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.endpoints.union.get_and_return_union(
	request=request=Animal_Dog(name="name", likes_to_woof=true, )
)
 
```                        


```python
from seed import SeedExhaustive
from seed.types.object import ObjectWithOptionalField

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.inlined_requests.post_with_object_bodyand_response(
	string="string",
	integer=1,
	nested_object=ObjectWithOptionalField(
		string="string",
		integer=1,
		long_=1000000,
		double=1.1,
		bool_=true,
		datetime="2024-01-15T09:30:00Z",
		date="2023-01-15",
		uuid_="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
		base_64="SGVsbG8gd29ybGQh",
		list_=[
			"list",
			"list"
		],
		map_={
			"1": "map"
		},
		bigint="1000000"
	)
)
 
```                        


```python
from seed import SeedExhaustive

client = SeedExhaustive(base_url="https://yourhost.com/path/to/api", token="YOUR_TOKEN", )        
client.no_auth.post_with_no_auth(
	request={"key":"value"}
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
	x_test_endpoint_header="X-TEST-ENDPOINT-HEADER",
	request="string"
)
 
```                        


