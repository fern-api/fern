# Reference
## Nullable
<details><summary><code>client.nullable.get_users() -> Internal::Types::Array[Seed::Nullable::Types::User]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.nullable.get_users(
  avatar: 'avatar',
  extra: true
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

**usernames:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**activated:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**extra:** `Internal::Types::Boolean` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable.create_user(request) -> Seed::Nullable::Types::User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.nullable.create_user(
  username: 'username',
  tags: ['tags', 'tags'],
  metadata: {
    created_at: '2024-01-15T09:30:00Z',
    updated_at: '2024-01-15T09:30:00Z',
    avatar: 'avatar',
    activated: true,
    values: {
      values: 'values'
    }
  },
  avatar: 'avatar'
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

**username:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Internal::Types::Array[String]` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `Seed::Nullable::Types::Metadata` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable.delete_user(request) -> Internal::Types::Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.nullable.delete_user(username: 'xy');
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

**username:** `String` — The user to delete.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
