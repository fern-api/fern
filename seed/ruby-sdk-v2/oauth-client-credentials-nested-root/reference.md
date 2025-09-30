# Reference
## auth
<details><summary><code>client.auth.get_token(request) -> Seed::Auth::Types::TokenResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.auth.get_token({
  clientId:'client_id',
  clientSecret:'client_secret',
  audience:'https://api.example.com',
  grantType:'client_credentials',
  scope:'scope'
});
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

## nested_no_auth api
<details><summary><code>client.nested_no_auth.api.get_something() -> </code></summary>
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


</dd>
</dl>
</details>

## nested api
<details><summary><code>client.nested.api.get_something() -> </code></summary>
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


</dd>
</dl>
</details>

## simple
<details><summary><code>client.simple.get_something() -> </code></summary>
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


</dd>
</dl>
</details>
