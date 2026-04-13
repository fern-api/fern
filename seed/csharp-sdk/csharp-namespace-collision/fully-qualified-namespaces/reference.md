# Reference
## _
<details><summary><code>client._.<a href="/src/SeedApi/_/Client.cs">CreateUserAsync</a>(User { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client._.CreateUserAsync(
    new User
    {
        Id = "id",
        Name = "name",
        Email = "email",
        Password = "password",
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

<details><summary><code>client._.<a href="/src/SeedApi/_/Client.cs">CreateTaskAsync</a>(Task { ... }) -> WithRawResponseTask&lt;Task&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client._.CreateTaskAsync(
    new global::SeedApi.Task
    {
        Id = "id",
        Name = "name",
        Email = "email",
        Password = "password",
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

**request:** `Task` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Scimconfiguration
<details><summary><code>client.Scimconfiguration.<a href="/src/SeedApi/Scimconfiguration/ScimconfigurationClient.cs">GetconfigurationAsync</a>() -> WithRawResponseTask&lt;ScimConfigurationScimConfiguration&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Scimconfiguration.GetconfigurationAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Scimconfiguration.<a href="/src/SeedApi/Scimconfiguration/ScimconfigurationClient.cs">CreatetokenAsync</a>(ScimConfigurationScimToken { ... }) -> WithRawResponseTask&lt;ScimConfigurationScimToken&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Scimconfiguration.CreatetokenAsync(
    new ScimConfigurationScimToken { TokenId = "tokenId", CreatedAt = "createdAt" }
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

**request:** `ScimConfigurationScimToken` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Scimconfiguration.<a href="/src/SeedApi/Scimconfiguration/ScimconfigurationClient.cs">ListusersAsync</a>() -> WithRawResponseTask&lt;IEnumerable&lt;User&gt;&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Scimconfiguration.ListusersAsync();
```
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## System
<details><summary><code>client.System.<a href="/src/SeedApi/System/SystemClient.cs">CreateuserAsync</a>(SystemUser { ... }) -> WithRawResponseTask&lt;SystemUser&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.System.CreateuserAsync(
    new SystemUser
    {
        Line1 = "line1",
        City = "city",
        State = "state",
        Zip = "zip",
        Country = SystemUserCountry.Usa,
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

**request:** `SystemUser` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.System.<a href="/src/SeedApi/System/SystemClient.cs">CreatetaskAsync</a>(SystemTask { ... }) -> WithRawResponseTask&lt;SystemTask&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.System.CreatetaskAsync(
    new SystemTask
    {
        Name = "name",
        User = new SystemUser
        {
            Line1 = "line1",
            City = "city",
            State = "state",
            Zip = "zip",
            Country = SystemUserCountry.Usa,
        },
        Owner = new SystemUser
        {
            Line1 = "line1",
            City = "city",
            State = "state",
            Zip = "zip",
            Country = SystemUserCountry.Usa,
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

**request:** `SystemTask` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.System.<a href="/src/SeedApi/System/SystemClient.cs">GetuserAsync</a>(SystemGetUserRequest { ... }) -> WithRawResponseTask&lt;SystemUser&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.System.GetuserAsync(new SystemGetUserRequest { UserId = "userId" });
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

**request:** `SystemGetUserRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

