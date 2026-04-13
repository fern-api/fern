# Reference
## Auth
<details><summary><code>client.auth.<a href="/lib/seed/auth/client.rb">gettokenwithclientcredentials</a>(request) -> Seed::Types::TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.gettokenwithclientcredentials(
  client_id: "client_id",
  client_secret: "client_secret",
  audience: "https://api.example.com",
  grant_type: "client_credentials"
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

**audience:** `Seed::Auth::Types::AuthGetTokenWithClientCredentialsRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `Seed::Auth::Types::AuthGetTokenWithClientCredentialsRequestGrantType` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `String` 
    
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

<details><summary><code>client.auth.<a href="/lib/seed/auth/client.rb">refreshtoken</a>(request) -> Seed::Types::TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.refreshtoken(
  client_id: "client_id",
  client_secret: "client_secret",
  refresh_token: "refresh_token",
  audience: "https://api.example.com",
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

**refresh_token:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**audience:** `Seed::Auth::Types::AuthRefreshTokenRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `Seed::Auth::Types::AuthRefreshTokenRequestGrantType` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `String` 
    
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

