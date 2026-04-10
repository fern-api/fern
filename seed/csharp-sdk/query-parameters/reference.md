# Reference
## User
<details><summary><code>client.User.<a href="/src/SeedApi/User/UserClient.cs">GetusernameAsync</a>(UserGetUsernameRequest { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetusernameAsync(
    new UserGetUsernameRequest
    {
        Limit = 1,
        Id = "id",
        Date = new DateOnly(2023, 1, 15),
        Deadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        Bytes = "bytes",
        User = new User
        {
            Name = "name",
            Tags = new List<string>() { "tags", "tags" },
        },
        UserList =
        [
            new User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
        ],
        OptionalDeadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        KeyValue = new Dictionary<string, string>() { { "keyValue", "keyValue" } },
        OptionalString = "optionalString",
        NestedUser = new NestedUser
        {
            Name = "name",
            User = new User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
        },
        OptionalUser = new User
        {
            Name = "name",
            Tags = new List<string>() { "tags", "tags" },
        },
        ExcludeUser =
        [
            new User
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

**request:** `UserGetUsernameRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

