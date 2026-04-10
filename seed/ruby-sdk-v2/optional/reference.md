# Reference
## Optional
<details><summary><code>client.optional.<a href="/lib/seed/optional/client.rb">sendoptionalbody</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.optional.sendoptionalbody(request: {})
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

**request_options:** `Seed::Optional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.optional.<a href="/lib/seed/optional/client.rb">sendoptionaltypedbody</a>(request) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.optional.sendoptionaltypedbody(message: "message")
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

**message:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Optional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.optional.<a href="/lib/seed/optional/client.rb">sendoptionalnullablewithalloptionalproperties</a>(action_id, id, request) -> Seed::Types::DeployResponse</code></summary>
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
client.optional.sendoptionalnullablewithalloptionalproperties(
  action_id: "actionId",
  id: "id"
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

**update_draft:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Optional::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

