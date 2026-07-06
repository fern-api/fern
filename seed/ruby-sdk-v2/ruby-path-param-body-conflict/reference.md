# Reference
## Identifiers
<details><summary><code>client.identifiers.<a href="/lib/seed/identifiers/client.rb">update</a>(id_type, request) -> Seed::Identifiers::Types::IdentifierUpdateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update an identifier whose path param shares a name with a body property.
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
client.identifiers.update(
  id_type_path_param: "phone",
  id_type: "phone",
  old_value: "+13175556789",
  new_value: "+13175556798"
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

**id_type:** `String` — The current identifier type in the URL path.
    
</dd>
</dl>

<dl>
<dd>

**id_type:** `String` — The new identifier type to set in the body.
    
</dd>
</dl>

<dl>
<dd>

**old_value:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**new_value:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Identifiers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.identifiers.<a href="/lib/seed/identifiers/client.rb">patch_metadata</a>(id_type, request) -> Seed::Identifiers::Types::IdentifierUpdateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Patch an identifier whose optional body property shares a name with a required path param.
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
client.identifiers.patch_metadata(
  id_type_path_param: "phone",
  label: "primary"
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

**id_type:** `String` — The identifier type in the URL path.
    
</dd>
</dl>

<dl>
<dd>

**id_type:** `String` — An optional replacement identifier type in the body.
    
</dd>
</dl>

<dl>
<dd>

**label:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Identifiers::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

