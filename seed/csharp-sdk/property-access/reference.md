# Reference
<details><summary><code>client.<a href="/src/SeedApi/SeedApiClient.cs">CreateUserAsync</a>(User { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateUserAsync(
    new User
    {
        Password = "password",
        Profile = new UserProfile
        {
            Name = "name",
            Verification = new UserProfileVerification(),
            Ssn = "ssn",
        },
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

**request:** `User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

