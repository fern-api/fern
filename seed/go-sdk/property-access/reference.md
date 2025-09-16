# Reference
<details><summary><code>client.CreateUser(request) -> *fern.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
client.CreateUser(
        context.TODO(),
        &fern.User{
            Id: "id",
            Email: "email",
            Password: "password",
            Profile: &fern.UserProfile{
                Name: "name",
                Verification: &fern.UserProfileVerification{
                    Verified: "verified",
                },
                Ssn: "ssn",
            },
        },
    )
}
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

**request:** `*fern.User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
