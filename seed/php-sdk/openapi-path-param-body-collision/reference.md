# Reference
<details><summary><code>$client-&gt;updateProfileIdentifier($profileId, $idTypePathParam, $request) -> ?UpdateProfileIdentifierResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->updateProfileIdentifier(
    'profile_123',
    'email',
    new IdentifierUpdate([
        'idType' => 'phone',
        'oldValue' => '+13175556789',
        'newValue' => '+13175556798',
    ]),
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

**$profileId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$idTypePathParam:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$idType:** `string` — The identifier type to update.
    
</dd>
</dl>

<dl>
<dd>

**$oldValue:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$newValue:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

