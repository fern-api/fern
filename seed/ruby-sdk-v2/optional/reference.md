# Reference
## Optional
<details><summary><code>client.optional.<a href="/lib/fern_optional/optional/client.rb">send_optional_body</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.optional.send_optional_body(request: {});
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

**request:** `Internal::Types::Hash[String, Object]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernOptional::Optional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.optional.<a href="/lib/fern_optional/optional/client.rb">send_optional_typed_body</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.optional.send_optional_typed_body(request: {
  message: 'message'
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

**request:** `FernOptional::Optional::Types::SendOptionalBodyRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernOptional::Optional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.optional.<a href="/lib/fern_optional/optional/client.rb">send_optional_nullable_with_all_optional_properties</a>(action_id, id, request) -> FernOptional::Optional::Types::DeployResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests optional(nullable(T)) where T has only optional properties.
This should not generate wire tests expecting {} when Optional.empty() is passed.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.optional.send_optional_nullable_with_all_optional_properties(
  action_id: 'actionId',
  id: 'id',
  request: {
    update_draft: true
  }
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

**action_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `FernOptional::Optional::Types::DeployParams` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `FernOptional::Optional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
