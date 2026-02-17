# Reference
<details><summary><code>client.<a href="/lib/seed/client.rb">get_foo</a>() -> Seed::Types::Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.get_foo(
  required_baz: "required_baz",
  required_nullable_baz: "required_nullable_baz"
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

**optional_baz:** `String` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**optional_nullable_baz:** `String` — An optional baz
    
</dd>
</dl>

<dl>
<dd>

**required_baz:** `String` — A required baz
    
</dd>
</dl>

<dl>
<dd>

**required_nullable_baz:** `String` — A required baz
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/lib/seed/client.rb">update_foo</a>(id, request) -> Seed::Types::Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.update_foo(
  id: "id",
  x_idempotency_key: "X-Idempotency-Key",
  nullable_text: "nullable_text",
  nullable_number: 1.1,
  non_nullable_text: "non_nullable_text"
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**x_idempotency_key:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_text:** `String` — Can be explicitly set to null to clear the value
    
</dd>
</dl>

<dl>
<dd>

**nullable_number:** `Integer` — Can be explicitly set to null to clear the value
    
</dd>
</dl>

<dl>
<dd>

**non_nullable_text:** `String` — Regular non-nullable field
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
