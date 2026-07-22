# Reference
<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">UpdateProfileIdentifierAsync</a>(IdentifierUpdate { ... }) -> WithRawResponseTask&lt;UpdateProfileIdentifierResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.UpdateProfileIdentifierAsync(
    new IdentifierUpdate
    {
        ProfileId = "profile_123",
        IdTypePathParam = "email",
        IdType = "phone",
        OldValue = "+13175556789",
        NewValue = "+13175556798",
    }
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

**request:** `IdentifierUpdate` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

