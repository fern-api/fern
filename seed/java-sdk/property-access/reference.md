# Reference
<details><summary><code>client.createUser(request) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.createUser(
    User
        .builder()
        .id("id")
        .email("email")
        .password("password")
        .profile(
            UserProfile
                .builder()
                .name("name")
                .verification(
                    UserProfileVerification
                        .builder()
                        .verified("verified")
                        .build()
                )
                .ssn("ssn")
                .build()
        )
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

**request:** `User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
