```python
from seed.user import User
from seed.user import NestedUser

client = SeedQueryParameters(base_url="https://yourhost.com/path/to/api", )        
client.user.get_username(
	limit=1,
	id="d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
	date="2023-01-15",
	deadline="2024-01-15T09:30:00Z",
	bytes="SGVsbG8gd29ybGQh",
	user=User(
		name="string",
		tags=[
			"string"
		]
	),
	user_list=[
		User(
			name="string"
		)
	],
	optional_deadline="2024-01-15T09:30:00Z",
	key_value={
		"string": "string"
	},
	optional_string="string",
	nested_user=NestedUser(
		name="string",
		user=User(
			name="string"
		)
	),
	optional_user=User(
		name="string",
		tags=[
			"string"
		]
	),
	exclude_user=User(
		name="string",
		tags=[
			"string"
		]
	),
	filter="string"
)
 
```                        


