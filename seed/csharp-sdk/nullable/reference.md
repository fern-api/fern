# Reference
## Nullable
<details><summary><code>client.Nullable.<a href="/src/SeedNullable/Nullable/NullableClient.cs">GetUsersAsync</a>(SeedNullable.GetUsersRequest { ... }) -> IEnumerable<SeedNullable.User></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Nullable.GetUsersAsync(
    new SeedNullable.GetUsersRequest
    {
        Usernames = ["usernames"],
        Avatar = "avatar",
        Activated = [true],
        Tags = ["tags"],
        Extra = true,
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

**request:** `SeedNullable.GetUsersRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullable.<a href="/src/SeedNullable/Nullable/NullableClient.cs">CreateUserAsync</a>(SeedNullable.CreateUserRequest { ... }) -> SeedNullable.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Nullable.CreateUserAsync(
    new SeedNullable.CreateUserRequest
    {
        Username = "username",
        Tags = new List<string>() { "tags", "tags" },
        Metadata = new SeedNullable.Metadata
        {
            CreatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
            UpdatedAt = new DateTime(2024, 01, 15, 09, 30, 00, 000),
            Avatar = "avatar",
            Activated = true,
            Status = new SeedNullable.Status(new SeedNullable.Status.Active()),
            Values = new Dictionary<string, string?>() { { "values", "values" } },
        },
        Avatar = "avatar",
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

**request:** `SeedNullable.CreateUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Nullable.<a href="/src/SeedNullable/Nullable/NullableClient.cs">DeleteUserAsync</a>(SeedNullable.DeleteUserRequest { ... }) -> bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Nullable.DeleteUserAsync(new SeedNullable.DeleteUserRequest { Username = "xy" });
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

**request:** `SeedNullable.DeleteUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
