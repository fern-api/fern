# Reference
## Auth
<details><summary><code>client.auth.<a href="/lib/seed/auth/client.rb">get_token</a>(request) -> Seed::Types::TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.get_token(
  client_id: "client_id",
  client_secret: "client_secret",
  scopes: "scopes",
  grant_type: "client_credentials",
  tenant: "tenant"
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

**audience:** `Seed::Auth::Types::GetTokenAuthRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**client_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**client_secret:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**scopes:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `Seed::Auth::Types::GetTokenAuthRequestGrantType` 
    
</dd>
</dl>

<dl>
<dd>

**tenant:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optional_hint:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Auth::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.auth.<a href="/lib/seed/auth/client.rb">refresh_token</a>(request) -> Seed::Types::TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.refresh_token(
  refresh_token: "refresh_token",
  grant_type: "refresh_token"
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

**refresh_token:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `Seed::Auth::Types::RefreshTokenAuthRequestGrantType` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Auth::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## System
<details><summary><code>client.system.<a href="/lib/seed/system/client.rb">health</a>() -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.system.health
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

**request_options:** `Seed::System::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Pets
<details><summary><code>client.pets.<a href="/lib/seed/pets/client.rb">list</a>() -> Internal::Types::Array[String]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.pets.list
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

**request_options:** `Seed::Pets::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

