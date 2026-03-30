# Reference
## Contacts
<details><summary><code>client.contacts.<a href="/lib/seed/contacts/client.rb">create</a>(request) -> Seed::Types::Contact</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a new contact. Returns 200 with the contact or 204 with no content.
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
client.contacts.create(name: "name")
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

**name:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**email:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `Seed::Contacts::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.contacts.<a href="/lib/seed/contacts/client.rb">get</a>(id) -> Seed::Types::Contact</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Gets a contact by ID. Returns 200 with the contact.
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
client.contacts.get(id: "id")
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

**request_options:** `Seed::Contacts::RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

