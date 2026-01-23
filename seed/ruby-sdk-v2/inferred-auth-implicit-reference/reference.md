# Reference
## Auth
<details><summary><code>client.auth.<a href="/lib/fern_inferred_auth_implicit_reference/auth/client.rb">get_token_with_client_credentials</a>(request) -> FernInferredAuthImplicitReference::Auth::Types::TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.get_token_with_client_credentials(
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

**request:** `FernInferredAuthImplicitReference::Auth::Types::GetTokenRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernInferredAuthImplicitReference::Auth::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.auth.<a href="/lib/fern_inferred_auth_implicit_reference/auth/client.rb">refresh_token</a>(request) -> FernInferredAuthImplicitReference::Auth::Types::TokenResponse</code></summary>
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

**request:** `FernInferredAuthImplicitReference::Auth::Types::RefreshTokenRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernInferredAuthImplicitReference::Auth::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedNoAuth Api
<details><summary><code>client.nested_no_auth.api.<a href="/lib/fern_inferred_auth_implicit_reference/nested_no_auth/api/client.rb">get_something</a>() -> </code></summary>
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

**request_options:** `FernInferredAuthImplicitReference::NestedNoAuth::Api::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Nested Api
<details><summary><code>client.nested.api.<a href="/lib/fern_inferred_auth_implicit_reference/nested/api/client.rb">get_something</a>() -> </code></summary>
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

**request_options:** `FernInferredAuthImplicitReference::Nested::Api::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Simple
<details><summary><code>client.simple.<a href="/lib/fern_inferred_auth_implicit_reference/simple/client.rb">get_something</a>() -> </code></summary>
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

**request_options:** `FernInferredAuthImplicitReference::Simple::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
