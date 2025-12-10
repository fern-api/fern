# Reference
## Auth
<details><summary><code>client.auth.<a href="/lib/seed/auth/client.rb">get_token_with_client_credentials</a>(request) -> Seed::Auth::Types::TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.get_token_with_client_credentials(
  cid: 'cid',
  csr: 'csr',
  scp: 'scp',
  entity_id: 'entity_id',
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

**cid:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**csr:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**scp:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**entity_id:** `String` 
    
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

**request_options:** `Seed::Auth::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.auth.<a href="/lib/seed/auth/client.rb">refresh_token</a>(request) -> Seed::Auth::Types::TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.refresh_token(
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

**request_options:** `Seed::Auth::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedNoAuth Api
<details><summary><code>client.nested_no_auth.api.<a href="/lib/seed/nested_no_auth/api/client.rb">get_something</a>() -> </code></summary>
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

**request_options:** `Seed::NestedNoAuth::Api::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Nested Api
<details><summary><code>client.nested.api.<a href="/lib/seed/nested/api/client.rb">get_something</a>() -> </code></summary>
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

**request_options:** `Seed::Nested::Api::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Simple
<details><summary><code>client.simple.<a href="/lib/seed/simple/client.rb">get_something</a>() -> </code></summary>
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

**request_options:** `Seed::Simple::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
