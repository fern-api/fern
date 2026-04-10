# Reference
## Service
<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">patch</a>(request) -> </code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```ruby
client.service.patch
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

**application:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**require_auth:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">patchcomplex</a>(id, request) -> </code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update with JSON merge patch - complex types.
This endpoint demonstrates the distinction between:
- optional<T> fields (can be present or absent, but not null)
- optional<nullable<T>> fields (can be present, absent, or null)
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
client.service.patchcomplex(id: "id")
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

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**age:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**active:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**metadata:** `Internal::Types::Hash[String, Object]` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `Internal::Types::Array[String]` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nickname:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**bio:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**profile_image_url:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**settings:** `Internal::Types::Hash[String, Object]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">namedpatchwithmixed</a>(id, request) -> </code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Named request with mixed optional/nullable fields and merge-patch content type.
This should trigger the NPE issue when optional fields aren't initialized.
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
client.service.namedpatchwithmixed(id: "id")
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

**app_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**instructions:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**active:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">optionalmergepatchtest</a>(request) -> </code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
This endpoint should:
1. Not NPE when fields are not provided (tests initialization)
2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
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
client.service.optionalmergepatchtest(required_field: "requiredField")
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

**required_field:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optional_string:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**optional_integer:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**optional_boolean:** `Internal::Types::Boolean` 
    
</dd>
</dl>

<dl>
<dd>

**nullable_string:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.service.<a href="/lib/seed/service/client.rb">regularpatch</a>(id, request) -> </code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Regular PATCH endpoint without merge-patch semantics
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
client.service.regularpatch(id: "id")
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

**field1:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**field2:** `Integer` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Service::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

