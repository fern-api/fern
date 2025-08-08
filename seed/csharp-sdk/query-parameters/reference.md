# Reference
## User
<details><summary><code>client.User.<a href="/src/SeedQueryParameters/User/UserClient.cs">GetUsernameAsync</a>(SeedQueryParameters.GetUsersRequest { ... }) -> SeedQueryParameters.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetUsernameAsync(
    new SeedQueryParameters.GetUsersRequest
    {
        Limit = 1,
        Id = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        Date = new DateOnly(2023, 1, 15),
        Deadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        Bytes = "SGVsbG8gd29ybGQh",
        User = new SeedQueryParameters.User
        {
            Name = "name",
            Tags = new List<string>() { "tags", "tags" },
        },
        UserList = new List<SeedQueryParameters.User>()
        {
            new SeedQueryParameters.User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
            new SeedQueryParameters.User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
        },
        OptionalDeadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        KeyValue = new Dictionary<string, string>() { { "keyValue", "keyValue" } },
        OptionalString = "optionalString",
        NestedUser = new SeedQueryParameters.NestedUser
        {
            Name = "name",
            User = new SeedQueryParameters.User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
        },
        OptionalUser = new SeedQueryParameters.User
        {
            Name = "name",
            Tags = new List<string>() { "tags", "tags" },
        },
        ExcludeUser =
        [
            new SeedQueryParameters.User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
        ],
        Filter = ["filter"],
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

**request:** `SeedQueryParameters.GetUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
