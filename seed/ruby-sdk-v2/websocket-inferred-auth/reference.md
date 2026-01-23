# Reference
## Auth
<details><summary><code>client.auth.<a href="/lib/fern_websocket_inferred_auth/auth/client.rb">get_token_with_client_credentials</a>(request) -> FernWebsocketInferredAuth::Auth::Types::TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.get_token_with_client_credentials(
  x_api_key: 'X-Api-Key',
  client_id: 'client_id',
  client_secret: 'client_secret',
  audience: 'https://api.example.com',
  grant_type: 'client_credentials',
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

**x_api_key:** `String` 
    
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

**audience:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernWebsocketInferredAuth::Auth::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.auth.<a href="/lib/fern_websocket_inferred_auth/auth/client.rb">refresh_token</a>(request) -> FernWebsocketInferredAuth::Auth::Types::TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.refresh_token(
  x_api_key: 'X-Api-Key',
  client_id: 'client_id',
  client_secret: 'client_secret',
  refresh_token: 'refresh_token',
  audience: 'https://api.example.com',
  grant_type: 'refresh_token',
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

**x_api_key:** `String` 
    
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

**refresh_token:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**audience:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**scope:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernWebsocketInferredAuth::Auth::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
