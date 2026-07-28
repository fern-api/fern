# Reference
<details><summary><code>client.updateProfileIdentifier(profileId, idTypePathParam, request) -> UpdateProfileIdentifierResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.updateProfileIdentifier(
    "profile_123",
    "email",
    IdentifierUpdate
        .builder()
        .idType("phone")
        .oldValue("+13175556789")
        .newValue("+13175556798")
        .build()
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

**profileId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**idTypePathParam:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**idType:** `String` — The identifier type to update.
    
</dd>
</dl>

<dl>
<dd>

**oldValue:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**newValue:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

