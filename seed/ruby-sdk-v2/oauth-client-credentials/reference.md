# Reference
## Auth
<details><summary><code>client.auth.<a href="/lib/fern_oauth_client_credentials/auth/client.rb">get_token_with_client_credentials</a>(request) -> FernOauthClientCredentials::Auth::Types::TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.get_token_with_client_credentials(
  client_id: 'my_oauth_app_123',
  client_secret: 'sk_live_abcdef123456789',
  audience: 'https://api.example.com',
  grant_type: 'client_credentials',
  scope: 'read:users'
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

**request_options:** `FernOauthClientCredentials::Auth::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.auth.<a href="/lib/fern_oauth_client_credentials/auth/client.rb">refresh_token</a>(request) -> FernOauthClientCredentials::Auth::Types::TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.refresh_token(
  client_id: 'my_oauth_app_123',
  client_secret: 'sk_live_abcdef123456789',
  refresh_token: 'refresh_token',
  audience: 'https://api.example.com',
  grant_type: 'refresh_token',
  scope: 'read:users'
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

**request_options:** `FernOauthClientCredentials::Auth::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedNoAuth Api
<details><summary><code>client.nested_no_auth.api.<a href="/lib/fern_oauth_client_credentials/nested_no_auth/api/client.rb">get_something</a>() -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.nested_no_auth.api.get_something();
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

**request_options:** `FernOauthClientCredentials::NestedNoAuth::Api::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Nested Api
<details><summary><code>client.nested.api.<a href="/lib/fern_oauth_client_credentials/nested/api/client.rb">get_something</a>() -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.nested.api.get_something();
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

**request_options:** `FernOauthClientCredentials::Nested::Api::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Simple
<details><summary><code>client.simple.<a href="/lib/fern_oauth_client_credentials/simple/client.rb">get_something</a>() -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.simple.get_something();
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

**request_options:** `FernOauthClientCredentials::Simple::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
