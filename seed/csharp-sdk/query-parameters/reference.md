# Reference
## User
<details><summary><code>client.User.<a href="/src/SeedQueryParameters/User/UserClient.cs">GetUsernameAsync</a>(GetUsersRequest { ... }) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetUsernameAsync(
    new GetUsersRequest
    {
        Limit = 1,
        Id = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        Date = new DateOnly(2023, 1, 15),
        Deadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        Bytes = "SGVsbG8gd29ybGQh",
        User = new User
        {
            Name = "string",
            Tags = new List<string>() { "string" },
        },
        UserList = new List<User>()
        {
            new User
            {
                Name = "string",
                Tags = new List<string>() { "string" },
            },
        },
        OptionalDeadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        KeyValue = new Dictionary<string, string>() { { "string", "string" } },
        OptionalString = "string",
        NestedUser = new NestedUser
        {
            Name = "string",
            User = new User
            {
                Name = "string",
                Tags = new List<string>() { "string" },
            },
        },
        OptionalUser = new User
        {
            Name = "string",
            Tags = new List<string>() { "string" },
        },
        ExcludeUser =
        [
            new User
            {
                Name = "string",
                Tags = new List<string>() { "string" },
            },
        ],
        Filter = ["string"],
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

**request:** `GetUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
