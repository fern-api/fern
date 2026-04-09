# Reference
## Endpoints Container
<details><summary><code>client.endpoints.container.<a href="/lib/seed/endpoints/container/client.rb">get_and_return_list_of_primitives</a>(request) -> Internal::Types::Array[String]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.container.get_and_return_list_of_primitives(request: %w[string string])
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

**request:** `Internal::Types::Array[String]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Container::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/lib/seed/endpoints/container/client.rb">get_and_return_list_of_objects</a>(request) -> Internal::Types::Array[Seed::Types::Object_::Types::ObjectWithRequiredField]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.container.get_and_return_list_of_objects(request: [{
  string: "string"
}, {
  string: "string"
}])
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

**request:** `Internal::Types::Array[Seed::Types::Object_::Types::ObjectWithRequiredField]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Container::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/lib/seed/endpoints/container/client.rb">get_and_return_set_of_primitives</a>(request) -> Internal::Types::Array[String]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.container.get_and_return_set_of_primitives(request: Set.new(["string"]))
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

**request:** `Internal::Types::Array[String]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Container::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/lib/seed/endpoints/container/client.rb">get_and_return_set_of_objects</a>(request) -> Internal::Types::Array[Seed::Types::Object_::Types::ObjectWithRequiredField]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.container.get_and_return_set_of_objects(request: Set.new([{
  string: "string"
}]))
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

**request:** `Internal::Types::Array[Seed::Types::Object_::Types::ObjectWithRequiredField]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Container::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/lib/seed/endpoints/container/client.rb">get_and_return_map_prim_to_prim</a>(request) -> Internal::Types::Hash[String, String]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.container.get_and_return_map_prim_to_prim(request: {
  string: "string"
})
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

**request:** `Internal::Types::Hash[String, String]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Container::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/lib/seed/endpoints/container/client.rb">get_and_return_map_of_prim_to_object</a>(request) -> Internal::Types::Hash[String, Seed::Types::Object_::Types::ObjectWithRequiredField]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.container.get_and_return_map_of_prim_to_object(request: {
  string: {
    string: "string"
  }
})
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

**request:** `Internal::Types::Hash[String, Seed::Types::Object_::Types::ObjectWithRequiredField]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Container::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/lib/seed/endpoints/container/client.rb">get_and_return_map_of_prim_to_undiscriminated_union</a>(request) -> Internal::Types::Hash[String, Seed::Types::Union::Types::MixedType]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.container.get_and_return_map_of_prim_to_undiscriminated_union(request: {
  string: 1.1
})
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

**request:** `Internal::Types::Hash[String, Seed::Types::Union::Types::MixedType]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Container::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.container.<a href="/lib/seed/endpoints/container/client.rb">get_and_return_optional</a>(request) -> Seed::Types::Object_::Types::ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.container.get_and_return_optional(request: {
  string: "string"
})
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

**request:** `Seed::Types::Object_::Types::ObjectWithRequiredField` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Container::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints ContentType
<details><summary><code>client.endpoints.content_type.<a href="/lib/seed/endpoints/content_type/client.rb">post_json_patch_content_type</a>(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.content_type.post_json_patch_content_type(
  string: "string",
  integer: 1,
  long: 1000000,
  double: 1.1,
  bool: true,
  datetime: "2024-01-15T09:30:00Z",
  date: "2023-01-15",
  uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  base64: "SGVsbG8gd29ybGQh",
  list: %w[list list],
  set: Set.new(["set"]),
  map: {
    1 => "map"
  },
  bigint: "1000000"
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

**request:** `Seed::Types::Object_::Types::ObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::ContentType::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.content_type.<a href="/lib/seed/endpoints/content_type/client.rb">post_json_patch_content_with_charset_type</a>(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.content_type.post_json_patch_content_with_charset_type(
  string: "string",
  integer: 1,
  long: 1000000,
  double: 1.1,
  bool: true,
  datetime: "2024-01-15T09:30:00Z",
  date: "2023-01-15",
  uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  base64: "SGVsbG8gd29ybGQh",
  list: %w[list list],
  set: Set.new(["set"]),
  map: {
    1 => "map"
  },
  bigint: "1000000"
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

**request:** `Seed::Types::Object_::Types::ObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::ContentType::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Enum
<details><summary><code>client.endpoints.enum.<a href="/lib/seed/endpoints/enum/client.rb">get_and_return_enum</a>(request) -> Seed::Types::Enum::Types::WeatherReport</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.enum.get_and_return_enum(request: "SUNNY")
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

**request:** `Seed::Types::Enum::Types::WeatherReport` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Enum::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints HTTPMethods
<details><summary><code>client.endpoints.http_methods.<a href="/lib/seed/endpoints/http_methods/client.rb">test_get</a>(id) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.http_methods.test_get(id: "id")
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::HTTPMethods::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.http_methods.<a href="/lib/seed/endpoints/http_methods/client.rb">test_post</a>(request) -> Seed::Types::Object_::Types::ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.http_methods.test_post(string: "string")
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

**request:** `Seed::Types::Object_::Types::ObjectWithRequiredField` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::HTTPMethods::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.http_methods.<a href="/lib/seed/endpoints/http_methods/client.rb">test_put</a>(id, request) -> Seed::Types::Object_::Types::ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.http_methods.test_put(
  id: "id",
  string: "string"
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Types::Object_::Types::ObjectWithRequiredField` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::HTTPMethods::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.http_methods.<a href="/lib/seed/endpoints/http_methods/client.rb">test_patch</a>(id, request) -> Seed::Types::Object_::Types::ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.http_methods.test_patch(
  id: "id",
  string: "string",
  integer: 1,
  long: 1000000,
  double: 1.1,
  bool: true,
  datetime: "2024-01-15T09:30:00Z",
  date: "2023-01-15",
  uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  base64: "SGVsbG8gd29ybGQh",
  list: %w[list list],
  set: Set.new(["set"]),
  map: {
    1 => "map"
  },
  bigint: "1000000"
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Types::Object_::Types::ObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::HTTPMethods::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.http_methods.<a href="/lib/seed/endpoints/http_methods/client.rb">test_delete</a>(id) -> Internal::Types::Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.http_methods.test_delete(id: "id")
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::HTTPMethods::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Object_
<details><summary><code>client.endpoints.object.<a href="/lib/seed/endpoints/object/client.rb">get_and_return_with_optional_field</a>(request) -> Seed::Types::Object_::Types::ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.object.get_and_return_with_optional_field(
  string: "string",
  integer: 1,
  long: 1000000,
  double: 1.1,
  bool: true,
  datetime: "2024-01-15T09:30:00Z",
  date: "2023-01-15",
  uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
  base64: "SGVsbG8gd29ybGQh",
  list: %w[list list],
  set: Set.new(["set"]),
  map: {
    1 => "map"
  },
  bigint: "1000000"
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

**request:** `Seed::Types::Object_::Types::ObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Object_::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/lib/seed/endpoints/object/client.rb">get_and_return_with_required_field</a>(request) -> Seed::Types::Object_::Types::ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.object.get_and_return_with_required_field(string: "string")
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

**request:** `Seed::Types::Object_::Types::ObjectWithRequiredField` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Object_::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/lib/seed/endpoints/object/client.rb">get_and_return_with_map_of_map</a>(request) -> Seed::Types::Object_::Types::ObjectWithMapOfMap</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.object.get_and_return_with_map_of_map(map: {
  map: {
    map: "map"
  }
})
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

**request:** `Seed::Types::Object_::Types::ObjectWithMapOfMap` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Object_::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/lib/seed/endpoints/object/client.rb">get_and_return_nested_with_optional_field</a>(request) -> Seed::Types::Object_::Types::NestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.object.get_and_return_nested_with_optional_field(
  string: "string",
  nested_object: {
    string: "string",
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: "2024-01-15T09:30:00Z",
    date: "2023-01-15",
    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    base64: "SGVsbG8gd29ybGQh",
    list: %w[list list],
    set: Set.new(["set"]),
    map: {
      1 => "map"
    },
    bigint: "1000000"
  }
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

**request:** `Seed::Types::Object_::Types::NestedObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Object_::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/lib/seed/endpoints/object/client.rb">get_and_return_nested_with_required_field</a>(string, request) -> Seed::Types::Object_::Types::NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.object.get_and_return_nested_with_required_field(
  string: "string",
  string: "string",
  nested_object: {
    string: "string",
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: "2024-01-15T09:30:00Z",
    date: "2023-01-15",
    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    base64: "SGVsbG8gd29ybGQh",
    list: %w[list list],
    set: Set.new(["set"]),
    map: {
      1 => "map"
    },
    bigint: "1000000"
  }
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

**string:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::Types::Object_::Types::NestedObjectWithRequiredField` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Object_::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/lib/seed/endpoints/object/client.rb">get_and_return_nested_with_required_field_as_list</a>(request) -> Seed::Types::Object_::Types::NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.object.get_and_return_nested_with_required_field_as_list(request: [{
  string: "string",
  nested_object: {
    string: "string",
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: "2024-01-15T09:30:00Z",
    date: "2023-01-15",
    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    base64: "SGVsbG8gd29ybGQh",
    list: %w[list list],
    set: Set.new(["set"]),
    map: {
      1 => "map"
    },
    bigint: "1000000"
  }
}, {
  string: "string",
  nested_object: {
    string: "string",
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: "2024-01-15T09:30:00Z",
    date: "2023-01-15",
    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    base64: "SGVsbG8gd29ybGQh",
    list: %w[list list],
    set: Set.new(["set"]),
    map: {
      1 => "map"
    },
    bigint: "1000000"
  }
}])
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

**request:** `Internal::Types::Array[Seed::Types::Object_::Types::NestedObjectWithRequiredField]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Object_::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/lib/seed/endpoints/object/client.rb">get_and_return_with_unknown_field</a>(request) -> Seed::Types::Object_::Types::ObjectWithUnknownField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.object.get_and_return_with_unknown_field
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

**request:** `Seed::Types::Object_::Types::ObjectWithUnknownField` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Object_::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/lib/seed/endpoints/object/client.rb">get_and_return_with_documented_unknown_type</a>(request) -> Seed::Types::Object_::Types::ObjectWithDocumentedUnknownType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.object.get_and_return_with_documented_unknown_type
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

**request:** `Seed::Types::Object_::Types::ObjectWithDocumentedUnknownType` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Object_::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/lib/seed/endpoints/object/client.rb">get_and_return_map_of_documented_unknown_type</a>(request) -> Internal::Types::Hash[String, Object]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.object.get_and_return_map_of_documented_unknown_type(request: {})
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

**request:** `Internal::Types::Hash[String, Object]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Object_::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.object.<a href="/lib/seed/endpoints/object/client.rb">get_and_return_with_datetime_like_string</a>(request) -> Seed::Types::Object_::Types::ObjectWithDatetimeLikeString</code></summary>
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

```ruby
client.endpoints.object.get_and_return_with_datetime_like_string(
  datetime_like_string: "2023-08-31T14:15:22Z",
  actual_datetime: "2023-08-31T14:15:22Z"
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

**request:** `Seed::Types::Object_::Types::ObjectWithDatetimeLikeString` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Object_::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Pagination
<details><summary><code>client.endpoints.pagination.<a href="/lib/seed/endpoints/pagination/client.rb">list_items</a>() -> Seed::Endpoints::Pagination::Types::PaginatedResponse</code></summary>
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

```ruby
client.endpoints.pagination.list_items(
  cursor: "cursor",
  limit: 1
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

**cursor:** `String` — The cursor for pagination
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Integer` — Maximum number of items to return
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Pagination::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Params
<details><summary><code>client.endpoints.params.<a href="/lib/seed/endpoints/params/client.rb">get_with_path</a>(param) -> String</code></summary>
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

```ruby
client.endpoints.params.get_with_path(param: "param")
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Params::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/lib/seed/endpoints/params/client.rb">get_with_inline_path</a>(param) -> String</code></summary>
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

```ruby
client.endpoints.params.get_with_path(param: "param")
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Params::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/lib/seed/endpoints/params/client.rb">get_with_query</a>() -> </code></summary>
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

```ruby
client.endpoints.params.get_with_query(
  query: "query",
  number: 1
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

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Params::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/lib/seed/endpoints/params/client.rb">get_with_allow_multiple_query</a>() -> </code></summary>
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

```ruby
client.endpoints.params.get_with_query(
  query: "query",
  number: 1
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

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Params::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/lib/seed/endpoints/params/client.rb">get_with_path_and_query</a>(param) -> </code></summary>
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

```ruby
client.endpoints.params.get_with_path_and_query(
  param: "param",
  query: "query"
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Params::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/lib/seed/endpoints/params/client.rb">get_with_inline_path_and_query</a>(param) -> </code></summary>
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

```ruby
client.endpoints.params.get_with_path_and_query(
  param: "param",
  query: "query"
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Params::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/lib/seed/endpoints/params/client.rb">modify_with_path</a>(param, request) -> String</code></summary>
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

```ruby
client.endpoints.params.modify_with_path(
  param: "param",
  request: "string"
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Params::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/lib/seed/endpoints/params/client.rb">modify_with_inline_path</a>(param, request) -> String</code></summary>
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

```ruby
client.endpoints.params.modify_with_path(
  param: "param",
  request: "string"
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Params::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/lib/seed/endpoints/params/client.rb">upload_with_path</a>(param, request) -> Seed::Types::Object_::Types::ObjectWithRequiredField</code></summary>
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

```ruby
client.endpoints.params.upload_with_path(param: "upload-path")
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Params::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.params.<a href="/lib/seed/endpoints/params/client.rb">get_with_path_and_errors</a>(param) -> String</code></summary>
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

```ruby
client.endpoints.params.get_with_path(param: "param")
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Params::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Primitive
<details><summary><code>client.endpoints.primitive.<a href="/lib/seed/endpoints/primitive/client.rb">get_and_return_string</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.primitive.get_and_return_string(request: "string")
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

**request:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Primitive::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/lib/seed/endpoints/primitive/client.rb">get_and_return_int</a>(request) -> Integer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.primitive.get_and_return_int(request: 1)
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

**request:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Primitive::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/lib/seed/endpoints/primitive/client.rb">get_and_return_long</a>(request) -> Integer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.primitive.get_and_return_long(request: 1000000)
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

**request:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Primitive::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/lib/seed/endpoints/primitive/client.rb">get_and_return_double</a>(request) -> Integer</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.primitive.get_and_return_double(request: 1.1)
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

**request:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Primitive::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/lib/seed/endpoints/primitive/client.rb">get_and_return_bool</a>(request) -> Internal::Types::Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.primitive.get_and_return_bool(request: true)
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

**request:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Primitive::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/lib/seed/endpoints/primitive/client.rb">get_and_return_datetime</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.primitive.get_and_return_datetime(request: "2024-01-15T09:30:00Z")
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

**request:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Primitive::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/lib/seed/endpoints/primitive/client.rb">get_and_return_date</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.primitive.get_and_return_date(request: "2023-01-15")
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

**request:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Primitive::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/lib/seed/endpoints/primitive/client.rb">get_and_return_uuid</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.primitive.get_and_return_uuid(request: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
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

**request:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Primitive::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.primitive.<a href="/lib/seed/endpoints/primitive/client.rb">get_and_return_base64</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.primitive.get_and_return_base64(request: "SGVsbG8gd29ybGQh")
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

**request:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Primitive::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Put
<details><summary><code>client.endpoints.put.<a href="/lib/seed/endpoints/put/client.rb">add</a>(id) -> Seed::Endpoints::Put::Types::PutResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.put.add(id: "id")
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Put::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints Union
<details><summary><code>client.endpoints.union.<a href="/lib/seed/endpoints/union/client.rb">get_and_return_union</a>(request) -> Seed::Types::Union::Types::Animal</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.union.get_and_return_union
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

**request:** `Seed::Types::Union::Types::Animal` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Endpoints::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Endpoints URLs
<details><summary><code>client.endpoints.urls.<a href="/lib/seed/endpoints/urls/client.rb">with_mixed_case</a>() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.urls.with_mixed_case
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

**request_options:** `Seed::Endpoints::URLs::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.urls.<a href="/lib/seed/endpoints/urls/client.rb">no_ending_slash</a>() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.urls.no_ending_slash
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

**request_options:** `Seed::Endpoints::URLs::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.urls.<a href="/lib/seed/endpoints/urls/client.rb">with_ending_slash</a>() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.urls.with_ending_slash
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

**request_options:** `Seed::Endpoints::URLs::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.endpoints.urls.<a href="/lib/seed/endpoints/urls/client.rb">with_underscores</a>() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.endpoints.urls.with_underscores
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

**request_options:** `Seed::Endpoints::URLs::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## InlinedRequests
<details><summary><code>client.inlined_requests.<a href="/lib/seed/inlined_requests/client.rb">post_with_object_bodyand_response</a>(request) -> Seed::Types::Object_::Types::ObjectWithOptionalField</code></summary>
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

```ruby
client.inlined_requests.post_with_object_bodyand_response(
  string: "string",
  integer: 1,
  nested_object: {
    string: "string",
    integer: 1,
    long: 1000000,
    double: 1.1,
    bool: true,
    datetime: "2024-01-15T09:30:00Z",
    date: "2023-01-15",
    uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    base64: "SGVsbG8gd29ybGQh",
    list: %w[list list],
    set: Set.new(["set"]),
    map: {
      1 => "map"
    },
    bigint: "1000000"
  }
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

**string:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**integer:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**nested_object:** `Seed::Types::Object_::Types::ObjectWithOptionalField` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::InlinedRequests::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoAuth
<details><summary><code>client.no_auth.<a href="/lib/seed/no_auth/client.rb">post_with_no_auth</a>(request) -> Internal::Types::Boolean</code></summary>
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

```ruby
client.no_auth.post_with_no_auth
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

**request:** `Object` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::NoAuth::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NoReqBody
<details><summary><code>client.no_req_body.<a href="/lib/seed/no_req_body/client.rb">get_with_no_request_body</a>() -> Seed::Types::Object_::Types::ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.no_req_body.get_with_no_request_body
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

**request_options:** `Seed::NoReqBody::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.no_req_body.<a href="/lib/seed/no_req_body/client.rb">post_with_no_request_body</a>() -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.no_req_body.post_with_no_request_body
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

**request_options:** `Seed::NoReqBody::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ReqWithHeaders
<details><summary><code>client.req_with_headers.<a href="/lib/seed/req_with_headers/client.rb">get_with_custom_header</a>(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.req_with_headers.get_with_custom_header(
  x_test_service_header: "X-TEST-SERVICE-HEADER",
  x_test_endpoint_header: "X-TEST-ENDPOINT-HEADER",
  body: "string"
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

**x_test_endpoint_header:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::ReqWithHeaders::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

