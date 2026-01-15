# Reference
## User
<details><summary><code>client.User.<a href="/src/SeedRequestParameters/User/UserClient.cs">CreateUsernameAsync</a>(CreateUsernameRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.CreateUsernameAsync(
    new CreateUsernameRequest
    {
        Tags = new List<string>() { "tags", "tags" },
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

**request:** `CreateUsernameRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedRequestParameters/User/UserClient.cs">CreateUsernameWithReferencedTypeAsync</a>(CreateUsernameReferencedRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.CreateUsernameWithReferencedTypeAsync(
    new CreateUsernameReferencedRequest
    {
        Tags = new List<string>() { "tags", "tags" },
        Body = new CreateUsernameBody
        {
            Username = "username",
            Password = "password",
            Name = "test",
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

**request:** `CreateUsernameReferencedRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedRequestParameters/User/UserClient.cs">CreateUsernameOptionalAsync</a>(CreateUsernameBodyOptionalProperties? { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.User.CreateUsernameOptionalAsync(new CreateUsernameBodyOptionalProperties());
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

**request:** `CreateUsernameBodyOptionalProperties?` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.User.<a href="/src/SeedRequestParameters/User/UserClient.cs">GetUsernameAsync</a>(GetUsersRequest { ... }) -> User</code></summary>
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
            Name = "name",
            Tags = new List<string>() { "tags", "tags" },
        },
        UserList = new List<User>()
        {
            new User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
            new User
            {
                Name = "name",
                Tags = new List<string>() { "tags", "tags" },
            },
        },
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

**request:** `GetUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
