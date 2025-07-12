```python


client = SeedNullable(
    base_url="https://yourhost.com/path/to/api",
)        
client.nullable.get_users(
    usernames="usernames",
	avatar="avatar",
	activated=true,
	tags="tags",
	extra=true
)

```


```python


client = SeedNullable(
    base_url="https://yourhost.com/path/to/api",
)        
client.nullable.create_user(
    username="username",
	tags=[
		"tags",
		"tags"
	],
	metadata={
		"created_at": "2024-01-15T09:30:00Z",
		"updated_at": "2024-01-15T09:30:00Z",
		"avatar": "avatar",
		"activated": true,
		"values": {
			"values": "values"
		}
	},
	avatar="avatar"
)

```


```python


client = SeedNullable(
    base_url="https://yourhost.com/path/to/api",
)        
client.nullable.delete_user(
    username="xy"
)

```


