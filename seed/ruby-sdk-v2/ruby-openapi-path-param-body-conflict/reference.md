# Reference
## Identifiers
<details><summary><code>client.identifiers.<a href="/lib/seed/identifiers/client.rb">update_profile_identifier</a>(store_id, profile_id, id_type, request) -> Seed::Identifiers::Types::UpdateProfileIdentifierResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Replace one of the stored values associated with the identifier type on a profile.
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
client.identifiers.update_profile_identifier(
  store_id: "mem_store_00000000000000000000000000",
  profile_id: "mem_profile_00000000000000000000000000",
  id_type_path_param: "email",
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

**store_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**profile_id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**id_type:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**identifier_update_id_type:** `String` — The identifier type to update (e.g., email, phone).
    
</dd>
</dl>

<dl>
<dd>

**old_value:** `String` — Existing stored value to replace.
    
</dd>
</dl>

<dl>
<dd>

**new_value:** `String` — New value to store for the identifier.
    
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

