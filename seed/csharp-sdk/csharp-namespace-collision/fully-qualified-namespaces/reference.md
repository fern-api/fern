# Reference
<details><summary><code>client.<a href="/src/SeedCsharpNamespaceCollision/SeedCsharpNamespaceCollisionClient.cs">CreateUserAsync</a>(User { ... }) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateUserAsync(
    new global::SeedCsharpNamespaceCollision.User
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

<details><summary><code>client.<a href="/src/SeedCsharpNamespaceCollision/SeedCsharpNamespaceCollisionClient.cs">CreateTaskAsync</a>(Task { ... }) -> Task</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateTaskAsync(
    new global::SeedCsharpNamespaceCollision.Task
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

## System
<details><summary><code>client.System.<a href="/src/SeedCsharpNamespaceCollision/System/SystemClient.cs">CreateUserAsync</a>(User { ... }) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.System.CreateUserAsync(
    new global::SeedCsharpNamespaceCollision.System.User
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

**request:** `User` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.System.<a href="/src/SeedCsharpNamespaceCollision/System/SystemClient.cs">CreateTaskAsync</a>(Task { ... }) -> Task</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.System.CreateTaskAsync(
    new global::SeedCsharpNamespaceCollision.System.Task
    {
        Name = "name",
        User = new global::SeedCsharpNamespaceCollision.System.User
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

**request:** `Task` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
