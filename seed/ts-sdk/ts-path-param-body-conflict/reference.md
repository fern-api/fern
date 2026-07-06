# Reference
## Identifiers
<details><summary><code>client.identifiers.<a href="/src/api/resources/identifiers/client/Client.ts">update</a>({ ...params }) -> SeedTsPathParamBodyConflict.IdentifierUpdateResponse</code></summary>
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

```typescript
await client.identifiers.update({
    idTypePathParam: "phone",
    idType: "phone",
    oldValue: "+13175556789",
    newValue: "+13175556798"
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

**request:** `SeedTsPathParamBodyConflict.IdentifierUpdate` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `IdentifiersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.identifiers.<a href="/src/api/resources/identifiers/client/Client.ts">patchMetadata</a>({ ...params }) -> SeedTsPathParamBodyConflict.IdentifierUpdateResponse</code></summary>
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

```typescript
await client.identifiers.patchMetadata({
    idTypePathParam: "phone",
    label: "primary"
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

**request:** `SeedTsPathParamBodyConflict.IdentifierMetadataPatch` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `IdentifiersClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

