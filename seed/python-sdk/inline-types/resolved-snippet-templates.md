```python
from seed import InlineType1
from seed import NestedInlineType1

client = SeedObject(base_url="https://yourhost.com/path/to/api", )        
client.get_root(
	bar=InlineType1(
		foo="foo",
		bar=NestedInlineType1(
			foo="foo"
		)
	),
	foo="foo"
)
 
```                        


