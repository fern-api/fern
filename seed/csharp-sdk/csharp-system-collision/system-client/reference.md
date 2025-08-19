# Reference
<details><summary><code>client.<a href="/src/SeedCsharpSystemCollision/System.cs">CreateUserAsync</a>(User { ... }) -> User</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateUserAsync(
    new User
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

<details><summary><code>client.<a href="/src/SeedCsharpSystemCollision/System.cs">CreateTaskAsync</a>(Task { ... }) -> Task</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateTaskAsync(
    new Task
    {
        Name = "name",
        User = new User
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
