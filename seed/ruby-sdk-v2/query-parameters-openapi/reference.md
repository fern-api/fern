# Reference
<details><summary><code>client.<a href="/lib/fern_query_parameters_openapi/client.rb">search</a>() -> FernQueryParametersOpenapi::Types::SearchResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.search(
  limit: 1,
  id: 'id',
  date: '2023-01-15',
  deadline: '2024-01-15T09:30:00Z',
  bytes: 'bytes',
  user: {
    name: 'name',
    tags: ['tags', 'tags']
  },
  optional_deadline: '2024-01-15T09:30:00Z',
  key_value: {
    keyValue: 'keyValue'
  },
  optional_string: 'optionalString',
  nested_user: {
    name: 'name',
    user: {
      name: 'name',
      tags: ['tags', 'tags']
    }
  },
  optional_user: {
    name: 'name',
    tags: ['tags', 'tags']
  },
  neighbor: {
    name: 'name',
    tags: ['tags', 'tags']
  },
  neighbor_required: {
    name: 'name',
    tags: ['tags', 'tags']
  }
);
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

**limit:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**date:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**deadline:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**bytes:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**user:** `FernQueryParametersOpenapi::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**user_list:** `FernQueryParametersOpenapi::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**optional_deadline:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**key_value:** `Internal::Types::Hash[String, String]` 
    
</dd>
</dl>

<dl>
<dd>

**optional_string:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nested_user:** `FernQueryParametersOpenapi::Types::NestedUser` 
    
</dd>
</dl>

<dl>
<dd>

**optional_user:** `FernQueryParametersOpenapi::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**exclude_user:** `FernQueryParametersOpenapi::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**neighbor:** `FernQueryParametersOpenapi::Types::SearchRequestNeighbor` 
    
</dd>
</dl>

<dl>
<dd>

**neighbor_required:** `FernQueryParametersOpenapi::Types::SearchRequestNeighborRequired` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernQueryParametersOpenapi::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
