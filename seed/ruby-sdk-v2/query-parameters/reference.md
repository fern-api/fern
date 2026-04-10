# Reference
## User
<details><summary><code>client.user.<a href="/lib/seed/user/client.rb">getusername</a>() -> Seed::Types::User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.getusername(
  limit: 1,
  id: "id",
  date: "2023-01-15",
  deadline: "2024-01-15T09:30:00Z",
  bytes: "bytes",
  user: {
    name: "name",
    tags: %w[tags tags]
  },
  optional_deadline: "2024-01-15T09:30:00Z",
  key_value: {
    keyValue: "keyValue"
  },
  optional_string: "optionalString",
  nested_user: {
    name: "name",
    user: {
      name: "name",
      tags: %w[tags tags]
    }
  },
  optional_user: {
    name: "name",
    tags: %w[tags tags]
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

**user:** `Seed::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**user_list:** `Seed::Types::User` 
    
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

**nested_user:** `Seed::Types::NestedUser` 
    
</dd>
</dl>

<dl>
<dd>

**optional_user:** `Seed::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**exclude_user:** `Seed::Types::User` 
    
</dd>
</dl>

<dl>
<dd>

**filter:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::User::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

