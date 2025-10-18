# Reference
## User
<details><summary><code>client.user.create_username(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.create_username(
  tags: ['tags', 'tags'],
  username: 'username',
  password: 'password',
  name: 'test'
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

**tags:** `Internal::Types::Array[String]` 
    
</dd>
</dl>

<dl>
<dd>

**username:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**password:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**name:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.create_username_with_referenced_type(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.create_username_with_referenced_type(tags: ['tags', 'tags']);
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

**tags:** `Internal::Types::Array[String]` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Seed::User::Types::CreateUsernameBody` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.create_username_optional(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.create_username_optional({});
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

**request:** `Seed::User::Types::CreateUsernameBodyOptionalProperties` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

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
  userList: [{
    name: 'name',
    tags: ['tags', 'tags']
  }, {
    name: 'name',
    tags: ['tags', 'tags']
  }],
  optionalDeadline: '2024-01-15T09:30:00Z',
  keyValue: {
    keyValue: 'keyValue'
  },
  optionalString: 'optionalString',
  nestedUser: {
    name: 'name',
    user: {
      name: 'name',
      tags: ['tags', 'tags']
    }
  },
  optionalUser: {
    name: 'name',
    tags: ['tags', 'tags']
  },
  excludeUser: ,
  filter: ,
  longParam: 1000000,
  bigIntParam: '1000000'
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

<dl>
<dd>

**long_param:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**big_int_param:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
