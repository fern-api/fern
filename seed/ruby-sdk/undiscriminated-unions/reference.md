# Reference
## Union
<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">get</a>(request) -> Seed::Union::Types::MyUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.get(request: 'string');
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

**request:** `Seed::Union::Types::MyUnion` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">get_metadata</a>() -> Internal::Types::Hash[Seed::Union::Types::Key, String]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.get_metadata();
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

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">update_metadata</a>(request) -> Internal::Types::Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.update_metadata(request: {});
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

**request:** `Seed::Union::Types::MetadataUnion` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">call</a>(request) -> Internal::Types::Boolean</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.call(union: {});
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

**request:** `Seed::Union::Types::Request` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">duplicate_types_union</a>(request) -> Seed::Union::Types::UnionWithDuplicateTypes</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.duplicate_types_union(request: 'string');
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

**request:** `Seed::Union::Types::UnionWithDuplicateTypes` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">nested_unions</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.nested_unions(request: 'string');
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

**request:** `Seed::Union::Types::NestedUnionRoot` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.union.<a href="/lib/seed/union/client.rb">test_camel_case_properties</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.union.test_camel_case_properties(payment_method: {
  method_: 'card',
  card_number: '1234567890123456'
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

**payment_method:** `Seed::Union::Types::PaymentMethodUnion` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Union::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
