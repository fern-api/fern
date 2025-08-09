# Reference
## User
<details><summary><code>client.User.<a href="/src/SeedRequestParameters/User/UserClient.cs">CreateUsernameAsync</a>(SeedRequestParameters.CreateUsernameRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.CreateUsernameAsync(
    new SeedRequestParameters.CreateUsernameRequest
    {
        Username = "username",
        Password = "password",
        Name = "test",
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

**request:** `SeedRequestParameters.CreateUsernameRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedRequestParameters/User/UserClient.cs">GetUsernameAsync</a>(SeedRequestParameters.GetUsersRequest { ... }) -> SeedRequestParameters.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.GetUsernameAsync(
    new SeedRequestParameters.GetUsersRequest
    {
        Limit = 1,
        Id = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        Date = new DateOnly(2023, 1, 15),
        Deadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        Bytes = "SGVsbG8gd29ybGQh",
        User = new SeedRequestParameters.User
        {
            Name = "name",
            Tags = new List<string>() { "tags", "tags" },
        },
        UserList = new List<SeedRequestParameters.User>()
        {
            new SeedRequestParameters.User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
            new SeedRequestParameters.User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
        },
        OptionalDeadline = new DateTime(2024, 01, 15, 09, 30, 00, 000),
        KeyValue = new Dictionary<string, string>() { { "keyValue", "keyValue" } },
        OptionalString = "optionalString",
        NestedUser = new SeedRequestParameters.NestedUser
        {
            Name = "name",
            User = new SeedRequestParameters.User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
        },
        OptionalUser = new SeedRequestParameters.User
        {
            Name = "name",
            Tags = new List<string>() { "tags", "tags" },
        },
        ExcludeUser =
        [
            new SeedRequestParameters.User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
        ],
        Filter = ["filter"],
        LongParam = 1000000,
        BigIntParam = "1000000",
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

**request:** `SeedRequestParameters.GetUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
