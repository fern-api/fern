# Reference
## EndpointsContainer
<details><summary><code>client.endpoints_container.<a href="src/seed/endpoints_container/client.py">endpoints_container_get_and_return_list_of_primitives</a>(...) -> typing.List[str]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_container.endpoints_container_get_and_return_list_of_primitives(
    request=[
        "string"
    ],
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

**request:** `typing.List[str]` 
    
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

<details><summary><code>client.endpoints_container.<a href="src/seed/endpoints_container/client.py">endpoints_container_get_and_return_list_of_objects</a>(...) -> typing.List[TypesObjectWithRequiredField]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive, TypesObjectWithRequiredField

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_container.endpoints_container_get_and_return_list_of_objects(
    request=[
        TypesObjectWithRequiredField(
            string="string",
        )
    ],
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

**request:** `typing.List[TypesObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpoints_container.<a href="src/seed/endpoints_container/client.py">endpoints_container_get_and_return_set_of_primitives</a>(...) -> typing.List[str]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_container.endpoints_container_get_and_return_set_of_primitives(
    request=[
        "string"
    ],
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

**request:** `typing.List[str]` 
    
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

<details><summary><code>client.endpoints_container.<a href="src/seed/endpoints_container/client.py">endpoints_container_get_and_return_set_of_objects</a>(...) -> typing.List[TypesObjectWithRequiredField]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive, TypesObjectWithRequiredField

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_container.endpoints_container_get_and_return_set_of_objects(
    request=[
        TypesObjectWithRequiredField(
            string="string",
        )
    ],
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

**request:** `typing.List[TypesObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpoints_container.<a href="src/seed/endpoints_container/client.py">endpoints_container_get_and_return_map_prim_to_prim</a>(...) -> typing.Dict[str, str]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_container.endpoints_container_get_and_return_map_prim_to_prim(
    request={
        "key": "value"
    },
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

**request:** `typing.Dict[str, str]` 
    
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

<details><summary><code>client.endpoints_container.<a href="src/seed/endpoints_container/client.py">endpoints_container_get_and_return_map_of_prim_to_object</a>(...) -> typing.Dict[str, TypesObjectWithRequiredField]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive, TypesObjectWithRequiredField

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_container.endpoints_container_get_and_return_map_of_prim_to_object(
    request={
        "key": TypesObjectWithRequiredField(
            string="string",
        )
    },
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

**request:** `typing.Dict[str, TypesObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpoints_container.<a href="src/seed/endpoints_container/client.py">endpoints_container_get_and_return_map_of_prim_to_undiscriminated_union</a>(...) -> typing.Dict[str, TypesMixedType]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_container.endpoints_container_get_and_return_map_of_prim_to_undiscriminated_union(
    request={
        "key": 1.1
    },
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

**request:** `typing.Dict[str, TypesMixedType]` 
    
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

<details><summary><code>client.endpoints_container.<a href="src/seed/endpoints_container/client.py">endpoints_container_get_and_return_optional</a>(...) -> TypesObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_container.endpoints_container_get_and_return_optional(
    string="string",
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

**request:** `TypesObjectWithRequiredField` 
    
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

## EndpointsContentType
<details><summary><code>client.endpoints_content_type.<a href="src/seed/endpoints_content_type/client.py">endpoints_content_type_post_json_patch_content_type</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_content_type.endpoints_content_type_post_json_patch_content_type()

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

**request:** `TypesObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints_content_type.<a href="src/seed/endpoints_content_type/client.py">endpoints_content_type_post_json_patch_content_with_charset_type</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_content_type.endpoints_content_type_post_json_patch_content_with_charset_type()

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

**request:** `TypesObjectWithOptionalField` 
    
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

## EndpointsEnum
<details><summary><code>client.endpoints_enum.<a href="src/seed/endpoints_enum/client.py">endpoints_enum_get_and_return_enum</a>(...) -> TypesWeatherReport</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_enum.endpoints_enum_get_and_return_enum(
    request="SUNNY",
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

**request:** `TypesWeatherReport` 
    
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

## EndpointsHttpMethods
<details><summary><code>client.endpoints_http_methods.<a href="src/seed/endpoints_http_methods/client.py">endpoints_http_methods_test_get</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_http_methods.endpoints_http_methods_test_get(
    id="id",
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

**id:** `str` 
    
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

<details><summary><code>client.endpoints_http_methods.<a href="src/seed/endpoints_http_methods/client.py">endpoints_http_methods_test_put</a>(...) -> TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_http_methods.endpoints_http_methods_test_put(
    id="id",
    string="string",
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

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TypesObjectWithRequiredField` 
    
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

<details><summary><code>client.endpoints_http_methods.<a href="src/seed/endpoints_http_methods/client.py">endpoints_http_methods_test_delete</a>(...) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_http_methods.endpoints_http_methods_test_delete(
    id="id",
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

**id:** `str` 
    
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

<details><summary><code>client.endpoints_http_methods.<a href="src/seed/endpoints_http_methods/client.py">endpoints_http_methods_test_patch</a>(...) -> TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_http_methods.endpoints_http_methods_test_patch(
    id="id",
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

**id:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TypesObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints_http_methods.<a href="src/seed/endpoints_http_methods/client.py">endpoints_http_methods_test_post</a>(...) -> TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_http_methods.endpoints_http_methods_test_post(
    string="string",
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

**request:** `TypesObjectWithRequiredField` 
    
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

## EndpointsObject
<details><summary><code>client.endpoints_object.<a href="src/seed/endpoints_object/client.py">endpoints_object_get_and_return_with_optional_field</a>(...) -> TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_object.endpoints_object_get_and_return_with_optional_field()

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

**request:** `TypesObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints_object.<a href="src/seed/endpoints_object/client.py">endpoints_object_get_and_return_with_required_field</a>(...) -> TypesObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_object.endpoints_object_get_and_return_with_required_field(
    string="string",
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

**request:** `TypesObjectWithRequiredField` 
    
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

<details><summary><code>client.endpoints_object.<a href="src/seed/endpoints_object/client.py">endpoints_object_get_and_return_with_map_of_map</a>(...) -> TypesObjectWithMapOfMap</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_object.endpoints_object_get_and_return_with_map_of_map(
    map_={
        "key": {
            "key": "value"
        }
    },
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

**request:** `TypesObjectWithMapOfMap` 
    
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

<details><summary><code>client.endpoints_object.<a href="src/seed/endpoints_object/client.py">endpoints_object_get_and_return_nested_with_optional_field</a>(...) -> TypesNestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_object.endpoints_object_get_and_return_nested_with_optional_field()

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

**request:** `TypesNestedObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints_object.<a href="src/seed/endpoints_object/client.py">endpoints_object_get_and_return_nested_with_required_field</a>(...) -> TypesNestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive, TypesObjectWithOptionalField

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_object.endpoints_object_get_and_return_nested_with_required_field(
    string_="string",
    string="string",
    nested_object=TypesObjectWithOptionalField(),
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

**string:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TypesNestedObjectWithRequiredField` 
    
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

<details><summary><code>client.endpoints_object.<a href="src/seed/endpoints_object/client.py">endpoints_object_get_and_return_nested_with_required_field_as_list</a>(...) -> TypesNestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive, TypesNestedObjectWithRequiredField, TypesObjectWithOptionalField

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_object.endpoints_object_get_and_return_nested_with_required_field_as_list(
    request=[
        TypesNestedObjectWithRequiredField(
            string="string",
            nested_object=TypesObjectWithOptionalField(),
        )
    ],
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

**request:** `typing.List[TypesNestedObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpoints_object.<a href="src/seed/endpoints_object/client.py">endpoints_object_get_and_return_with_unknown_field</a>(...) -> TypesObjectWithUnknownField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_object.endpoints_object_get_and_return_with_unknown_field(
    unknown={"key": "value"},
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

**request:** `TypesObjectWithUnknownField` 
    
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

<details><summary><code>client.endpoints_object.<a href="src/seed/endpoints_object/client.py">endpoints_object_get_and_return_with_documented_unknown_type</a>(...) -> TypesObjectWithDocumentedUnknownType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_object.endpoints_object_get_and_return_with_documented_unknown_type(
    documented_unknown_type={"key": "value"},
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

**request:** `TypesObjectWithDocumentedUnknownType` 
    
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

<details><summary><code>client.endpoints_object.<a href="src/seed/endpoints_object/client.py">endpoints_object_get_and_return_map_of_documented_unknown_type</a>(...) -> TypesMapOfDocumentedUnknownType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_object.endpoints_object_get_and_return_map_of_documented_unknown_type(
    request={},
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

**request:** `TypesMapOfDocumentedUnknownType` 
    
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

<details><summary><code>client.endpoints_object.<a href="src/seed/endpoints_object/client.py">endpoints_object_get_and_return_with_mixed_required_and_optional_fields</a>(...) -> TypesObjectWithMixedRequiredAndOptionalFields</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that dynamic snippets include all required properties in the
object initializer, even when the example omits some required fields.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_object.endpoints_object_get_and_return_with_mixed_required_and_optional_fields(
    required_string="requiredString",
    required_integer=1,
    required_long=1000000,
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

**request:** `TypesObjectWithMixedRequiredAndOptionalFields` 
    
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

<details><summary><code>client.endpoints_object.<a href="src/seed/endpoints_object/client.py">endpoints_object_get_and_return_with_required_nested_object</a>(...) -> TypesObjectWithRequiredNestedObject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that dynamic snippets recursively construct default objects for
required properties whose type is a named object. When the example
omits the nested object, the generator should construct a default
initializer with the nested object's required properties filled in.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive, TypesNestedObjectWithRequiredField, TypesObjectWithOptionalField

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_object.endpoints_object_get_and_return_with_required_nested_object(
    required_string="requiredString",
    required_object=TypesNestedObjectWithRequiredField(
        string="string",
        nested_object=TypesObjectWithOptionalField(),
    ),
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

**request:** `TypesObjectWithRequiredNestedObject` 
    
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

<details><summary><code>client.endpoints_object.<a href="src/seed/endpoints_object/client.py">endpoints_object_get_and_return_with_datetime_like_string</a>(...) -> TypesObjectWithDatetimeLikeString</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that string fields containing datetime-like values are NOT reformatted.
The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
without being converted to "2023-08-31T14:15:22.000Z".
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive
import datetime

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_object.endpoints_object_get_and_return_with_datetime_like_string(
    datetime_like_string="datetimeLikeString",
    actual_datetime=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
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

**request:** `TypesObjectWithDatetimeLikeString` 
    
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

## EndpointsPagination
<details><summary><code>client.endpoints_pagination.<a href="src/seed/endpoints_pagination/client.py">endpoints_pagination_list_items</a>(...) -> EndpointsPaginatedResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List items with cursor pagination
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_pagination.endpoints_pagination_list_items()

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

**cursor:** `typing.Optional[str]` — The cursor for pagination
    
</dd>
</dl>

<dl>
<dd>

**limit:** `typing.Optional[int]` — Maximum number of items to return
    
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

## EndpointsParams
<details><summary><code>client.endpoints_params.<a href="src/seed/endpoints_params/client.py">endpoints_params_get_with_path</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_params.endpoints_params_get_with_path(
    param="param",
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

**param:** `str` 
    
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

<details><summary><code>client.endpoints_params.<a href="src/seed/endpoints_params/client.py">endpoints_params_upload_with_path</a>(...) -> TypesObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST bytes with path param returning object
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
client.endpoints_params.endpoints_params_upload_with_path(...)
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

**param:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `typing.Union[bytes, typing.Iterator[bytes], typing.AsyncIterator[bytes]]` 
    
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

<details><summary><code>client.endpoints_params.<a href="src/seed/endpoints_params/client.py">endpoints_params_modify_with_path</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_params.endpoints_params_modify_with_path(
    param="param",
    request="string",
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

**param:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `str` 
    
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

<details><summary><code>client.endpoints_params.<a href="src/seed/endpoints_params/client.py">endpoints_params_get_with_inline_path</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_params.endpoints_params_get_with_inline_path(
    param="param",
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

**param:** `str` 
    
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

<details><summary><code>client.endpoints_params.<a href="src/seed/endpoints_params/client.py">endpoints_params_modify_with_inline_path</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_params.endpoints_params_modify_with_inline_path(
    param="param",
    request="string",
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

**param:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `str` 
    
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

<details><summary><code>client.endpoints_params.<a href="src/seed/endpoints_params/client.py">endpoints_params_get_with_query</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with query param
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_params.endpoints_params_get_with_query(
    query="query",
    number=1,
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

**query:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `int` 
    
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

<details><summary><code>client.endpoints_params.<a href="src/seed/endpoints_params/client.py">endpoints_params_get_with_allow_multiple_query</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with multiple of same query param
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_params.endpoints_params_get_with_allow_multiple_query(
    query=[
        "query"
    ],
    number=[
        1
    ],
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

**query:** `typing.Optional[typing.Union[str, typing.Sequence[str]]]` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `typing.Optional[typing.Union[int, typing.Sequence[int]]]` 
    
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

<details><summary><code>client.endpoints_params.<a href="src/seed/endpoints_params/client.py">endpoints_params_get_with_path_and_query</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_params.endpoints_params_get_with_path_and_query(
    param="param",
    query="query",
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

**param:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `str` 
    
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

<details><summary><code>client.endpoints_params.<a href="src/seed/endpoints_params/client.py">endpoints_params_get_with_inline_path_and_query</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_params.endpoints_params_get_with_inline_path_and_query(
    param="param",
    query="query",
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

**param:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `str` 
    
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

<details><summary><code>client.endpoints_params.<a href="src/seed/endpoints_params/client.py">endpoints_params_get_with_boolean_path</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with boolean path param
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_params.endpoints_params_get_with_boolean_path(
    param=True,
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

**param:** `bool` 
    
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

<details><summary><code>client.endpoints_params.<a href="src/seed/endpoints_params/client.py">endpoints_params_get_with_path_and_errors</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param that can throw errors
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_params.endpoints_params_get_with_path_and_errors(
    param="param",
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

**param:** `str` 
    
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

## EndpointsPrimitive
<details><summary><code>client.endpoints_primitive.<a href="src/seed/endpoints_primitive/client.py">endpoints_primitive_get_and_return_string</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_primitive.endpoints_primitive_get_and_return_string(
    request="string",
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

**request:** `str` 
    
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

<details><summary><code>client.endpoints_primitive.<a href="src/seed/endpoints_primitive/client.py">endpoints_primitive_get_and_return_int</a>(...) -> int</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_primitive.endpoints_primitive_get_and_return_int(
    request=1,
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

**request:** `int` 
    
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

<details><summary><code>client.endpoints_primitive.<a href="src/seed/endpoints_primitive/client.py">endpoints_primitive_get_and_return_long</a>(...) -> int</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_primitive.endpoints_primitive_get_and_return_long(
    request=1000000,
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

**request:** `int` 
    
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

<details><summary><code>client.endpoints_primitive.<a href="src/seed/endpoints_primitive/client.py">endpoints_primitive_get_and_return_double</a>(...) -> float</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_primitive.endpoints_primitive_get_and_return_double(
    request=1.1,
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

**request:** `float` 
    
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

<details><summary><code>client.endpoints_primitive.<a href="src/seed/endpoints_primitive/client.py">endpoints_primitive_get_and_return_bool</a>(...) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_primitive.endpoints_primitive_get_and_return_bool(
    request=True,
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

**request:** `bool` 
    
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

<details><summary><code>client.endpoints_primitive.<a href="src/seed/endpoints_primitive/client.py">endpoints_primitive_get_and_return_datetime</a>(...) -> datetime.datetime</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive
import datetime

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_primitive.endpoints_primitive_get_and_return_datetime(
    request=datetime.datetime.fromisoformat("2024-01-15T09:30:00+00:00"),
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

**request:** `datetime.datetime` 
    
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

<details><summary><code>client.endpoints_primitive.<a href="src/seed/endpoints_primitive/client.py">endpoints_primitive_get_and_return_date</a>(...) -> datetime.date</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive
import datetime

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_primitive.endpoints_primitive_get_and_return_date(
    request=datetime.date.fromisoformat("2023-01-15"),
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

**request:** `datetime.date` 
    
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

<details><summary><code>client.endpoints_primitive.<a href="src/seed/endpoints_primitive/client.py">endpoints_primitive_get_and_return_uuid</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_primitive.endpoints_primitive_get_and_return_uuid(
    request="string",
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

**request:** `str` 
    
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

<details><summary><code>client.endpoints_primitive.<a href="src/seed/endpoints_primitive/client.py">endpoints_primitive_get_and_return_base64</a>(...) -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_primitive.endpoints_primitive_get_and_return_base64(
    request="string",
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

**request:** `str` 
    
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

## EndpointsPut
<details><summary><code>client.endpoints_put.<a href="src/seed/endpoints_put/client.py">endpoints_put_add</a>(...) -> EndpointsPutResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_put.endpoints_put_add(
    id="id",
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

**id:** `str` 
    
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

## EndpointsUnion
<details><summary><code>client.endpoints_union.<a href="src/seed/endpoints_union/client.py">endpoints_union_get_and_return_union</a>(...) -> TypesAnimal</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive, TypesAnimalZero

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_union.endpoints_union_get_and_return_union(
    request=TypesAnimalZero(
        name="name",
        likes_to_woof=True,
        animal="dog",
    ),
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

**request:** `TypesAnimal` 
    
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

## EndpointsUrLs
<details><summary><code>client.endpoints_ur_ls.<a href="src/seed/endpoints_ur_ls/client.py">endpoints_urls_with_mixed_case</a>() -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_ur_ls.endpoints_urls_with_mixed_case()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_ur_ls.<a href="src/seed/endpoints_ur_ls/client.py">endpoints_urls_no_ending_slash</a>() -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_ur_ls.endpoints_urls_no_ending_slash()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_ur_ls.<a href="src/seed/endpoints_ur_ls/client.py">endpoints_urls_with_ending_slash</a>() -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_ur_ls.endpoints_urls_with_ending_slash()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints_ur_ls.<a href="src/seed/endpoints_ur_ls/client.py">endpoints_urls_with_underscores</a>() -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.endpoints_ur_ls.endpoints_urls_with_underscores()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Inlinedrequests
<details><summary><code>client.inlinedrequests.<a href="src/seed/inlinedrequests/client.py">postwithobjectbodyandresponse</a>(...) -> TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST with custom object in request body, response is an object
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive, TypesObjectWithOptionalField

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.inlinedrequests.postwithobjectbodyandresponse(
    string="string",
    integer=1,
    nested_object=TypesObjectWithOptionalField(),
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

**string:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**integer:** `int` 
    
</dd>
</dl>

<dl>
<dd>

**nested_object:** `TypesObjectWithOptionalField` 
    
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

## Noauth
<details><summary><code>client.noauth.<a href="src/seed/noauth/client.py">postwithnoauth</a>(...) -> bool</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with no auth
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.noauth.postwithnoauth(
    request={"key": "value"},
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

**request:** `typing.Any` 
    
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

## Noreqbody
<details><summary><code>client.noreqbody.<a href="src/seed/noreqbody/client.py">getwithnorequestbody</a>() -> TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.noreqbody.getwithnorequestbody()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.noreqbody.<a href="src/seed/noreqbody/client.py">postwithnorequestbody</a>() -> str</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.noreqbody.postwithnorequestbody()

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

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Reqwithheaders
<details><summary><code>client.reqwithheaders.<a href="src/seed/reqwithheaders/client.py">getwithcustomheader</a>(...)</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import Exhaustive

client = Exhaustive(
    token="<token>",
    base_url="https://yourhost.com/path/to/api",
)

client.reqwithheaders.getwithcustomheader(
    test_endpoint_header="X-TEST-ENDPOINT-HEADER",
    request="string",
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

**test_endpoint_header:** `str` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `str` 
    
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

