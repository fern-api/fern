# Reference
<details><summary><code>client.get_foo() -> Seed::Types::Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.get_foo(
  requiredBaz: 'required_baz',
  requiredNullableBaz: 'required_nullable_baz'
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
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.update_foo(id, request) -> Seed::Types::Foo</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.update_foo(
  id: 'id',
  xIdempotencyKey: 'X-Idempotency-Key',
  nullableText: 'nullable_text',
  nullableNumber: 1.1,
  nonNullableText: 'non_nullable_text'
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
</dd>
</dl>


</dd>
</dl>
</details>
