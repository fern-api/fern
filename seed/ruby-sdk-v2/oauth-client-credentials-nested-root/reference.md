# Reference
## Auth
<details><summary><code>client.auth.<a href="/lib/seed/auth/client.rb">gettoken</a>(request) -> Seed::Types::AuthTokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.gettoken(
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

**audience:** `Seed::Auth::Types::AuthGetTokenRequestAudience` 
    
</dd>
</dl>

<dl>
<dd>

**grant_type:** `Seed::Auth::Types::AuthGetTokenRequestGrantType` 
    
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

## NestedNoAuthAPI
<details><summary><code>client.nested_no_auth_api.<a href="/lib/seed/nested_no_auth_api/client.rb">nested_no_auth_api_get_something</a>() -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.nested_no_auth_api.nested_no_auth_api_get_something
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

**request_options:** `Seed::NestedNoAuthAPI::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## NestedAPI
<details><summary><code>client.nested_api.<a href="/lib/seed/nested_api/client.rb">nested_api_get_something</a>() -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.nested_api.nested_api_get_something
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

**request_options:** `Seed::NestedAPI::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Simple
<details><summary><code>client.simple.<a href="/lib/seed/simple/client.rb">getsomething</a>() -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.simple.getsomething
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

