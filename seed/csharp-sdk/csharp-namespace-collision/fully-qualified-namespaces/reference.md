# Reference
<details><summary><code>client.<a href="/src/SeedSystem/SeedSystemClient.cs">CreateUserAsync</a>(global::SeedSystem.User { ... }) -> global::SeedSystem.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateUserAsync(
    new global::SeedSystem.User
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

**request:** `global::SeedSystem.User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.<a href="/src/SeedSystem/SeedSystemClient.cs">CreateTaskAsync</a>(global::SeedSystem.Task { ... }) -> global::SeedSystem.Task</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateTaskAsync(
    new global::SeedSystem.Task
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

**request:** `global::SeedSystem.Task` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## System
<details><summary><code>client.System.<a href="/src/SeedSystem/System/SystemClient.cs">CreateUserAsync</a>(global::SeedSystem.System.User { ... }) -> global::SeedSystem.System.User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.System.CreateUserAsync(
    new global::SeedSystem.System.User
    {
        Line1 = "line1",
        Line2 = "line2",
        City = "city",
        State = "state",
        Zip = "zip",
        Country = "USA",
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

**request:** `global::SeedSystem.System.User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.System.<a href="/src/SeedSystem/System/SystemClient.cs">CreateTaskAsync</a>(global::SeedSystem.System.Task { ... }) -> global::SeedSystem.System.Task</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.System.CreateTaskAsync(
    new global::SeedSystem.System.Task
    {
        Name = "name",
        User = new global::SeedSystem.System.User
        {
            Line1 = "line1",
            Line2 = "line2",
            City = "city",
            State = "state",
            Zip = "zip",
            Country = "USA",
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

**request:** `global::SeedSystem.System.Task` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
