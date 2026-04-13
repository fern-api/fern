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
        Line1 = "line1",
        City = "city",
        State = "state",
        Zip = "zip",
        Country = UserCountry.Usa,
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
    new SeedApi.Task
    {
        Name = "name",
        User = new User
        {
            Line1 = "line1",
            City = "city",
            State = "state",
            Zip = "zip",
            Country = UserCountry.Usa,
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

<details><summary><code>client._.<a href="/src/SeedApi/_/Client.cs">EmptyResponseAsync</a>(Task { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client._.EmptyResponseAsync(
    new SeedApi.Task
    {
        Name = "name",
        User = new User
        {
            Line1 = "line1",
            City = "city",
            State = "state",
            Zip = "zip",
            Country = UserCountry.Usa,
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

