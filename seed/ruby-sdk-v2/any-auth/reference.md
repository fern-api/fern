# Reference
## Auth
<details><summary><code>client.auth.get_token(request) -> Seed::Auth::Types::TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.get_token(
  clientId: 'client_id',
  clientSecret: 'client_secret',
  audience: 'https://api.example.com',
  grantType: 'client_credentials',
  scope: 'scope'
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

**clientId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**clientSecret:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**audience:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**grantType:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.user.get() -> Internal::Types::Array[Seed::User::Types::User]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.get();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.get_admins() -> Internal::Types::Array[Seed::User::Types::User]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.user.get_admins();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
