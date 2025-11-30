# Reference
## User
<details><summary><code>client.user.get_username() -> Seed::User::Types::User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.get_username(
  limit: 1,
  id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
  date: '2023-01-15',
  deadline: '2024-01-15T09:30:00Z',
  bytes: 'SGVsbG8gd29ybGQh',
  user: {
    name: 'name',
    tags: ['tags', 'tags']
  },
  user_list: [{
    name: 'name',
    tags: ['tags', 'tags']
  }, {
    name: 'name',
    tags: ['tags', 'tags']
  }],
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

**user:** `Seed::User::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**user_list:** `Internal::Types::Array[Seed::User::Types::User]` 
    
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

**nested_user:** `Seed::User::Types::NestedUser` 
    
</dd>
</dl>

<dl>
<dd>

**optional_user:** `Seed::User::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**exclude_user:** `Seed::User::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
