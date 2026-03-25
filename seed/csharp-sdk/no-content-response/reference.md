# Reference
## Contacts
<details><summary><code>client.Contacts.<a href="/src/SeedApi/Contacts/ContactsClient.cs">CreateAsync</a>(CreateContactRequest { ... }) -> WithRawResponseTask&lt;Contact?&gt;</code></summary>
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

```csharp
await client.Contacts.CreateAsync(new CreateContactRequest { Name = "name" });
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

**request:** `CreateContactRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Contacts.<a href="/src/SeedApi/Contacts/ContactsClient.cs">GetAsync</a>(GetContactsRequest { ... }) -> WithRawResponseTask&lt;Contact&gt;</code></summary>
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

```csharp
await client.Contacts.GetAsync(new GetContactsRequest { Id = "id" });
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

**request:** `GetContactsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

