# Reference
<details><summary><code>client.UpdateProfileIdentifier(ProfileID, IDTypePathParam, request) -> *fern.UpdateProfileIdentifierResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.IdentifierUpdate{
    ProfileID: "profile_123",
    IDTypePathParam: "email",
    IDType: "phone",
    OldValue: "+13175556789",
    NewValue: "+13175556798",
}
client.UpdateProfileIdentifier(
    context.TODO(),
    request,
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

**profileID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**idTypePathParam:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**idType:** `string` — The identifier type to update.
    
</dd>
</dl>

<dl>
<dd>

**oldValue:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**newValue:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

