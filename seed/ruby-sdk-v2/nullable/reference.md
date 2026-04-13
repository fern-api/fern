# Reference
## Nullable
<details><summary><code>client.nullable.<a href="/lib/seed/nullable/client.rb">getusers</a>() -> Internal::Types::Array[Seed::Types::User]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.nullable.getusers
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

<dl>
<dd>

**request_options:** `Seed::Nullable::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable.<a href="/lib/seed/nullable/client.rb">createuser</a>(request) -> Seed::Types::User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.nullable.createuser(username: "username")
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

**metadata:** `Seed::Types::Metadata` 
    
</dd>
</dl>

<dl>
<dd>

**avatar:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Nullable::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.nullable.<a href="/lib/seed/nullable/client.rb">deleteuser</a>(request) -> Internal::Types::Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.nullable.deleteuser
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

<dl>
<dd>

**request_options:** `Seed::Nullable::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

