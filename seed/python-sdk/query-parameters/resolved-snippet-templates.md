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
		name="name",
		tags=[
			"tags",
			"tags"
		]
	),
	user_list=[
		User(
			name="name"
		),
		User(
			name="name"
		)
	],
	optional_deadline="2024-01-15T09:30:00Z",
	key_value={
		"keyValue": "keyValue"
	},
	optional_string="optionalString",
	nested_user=NestedUser(
		name="name",
		user=User(
			name="name"
		)
	),
	optional_user=User(
		name="name",
		tags=[
			"tags",
			"tags"
		]
	),
	exclude_user=User(
		name="name",
		tags=[
			"tags",
			"tags"
		]
	),
	filter="filter"
)

```


