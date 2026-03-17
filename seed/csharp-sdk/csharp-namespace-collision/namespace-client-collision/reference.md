# Reference
<details><summary><code>client.<a href="/src/Contoso.Net/Contoso.cs">CreateUserAsync</a>(User { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateUserAsync(
    new global::Contoso.Net.User
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

<details><summary><code>client.<a href="/src/Contoso.Net/Contoso.cs">CreateTaskAsync</a>(Task { ... }) -> WithRawResponseTask&lt;Task&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.CreateTaskAsync(
    new global::Contoso.Net.Task
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
<details><summary><code>client.System.<a href="/src/Contoso.Net/System/SystemClient.cs">CreateUserAsync</a>(User { ... }) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.System.CreateUserAsync(
    new global::Contoso.Net.System.User
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

<details><summary><code>client.System.<a href="/src/Contoso.Net/System/SystemClient.cs">CreateTaskAsync</a>(Task { ... }) -> WithRawResponseTask&lt;Task&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.System.CreateTaskAsync(
    new global::Contoso.Net.System.Task
    {
        Name = "name",
        User = new global::Contoso.Net.System.User
        {
            Line1 = "line1",
            Line2 = "line2",
            City = "city",
            State = "state",
            Zip = "zip",
            Country = "USA",
        },
        Owner = new global::Contoso.Net.System.User
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

<details><summary><code>client.System.<a href="/src/Contoso.Net/System/SystemClient.cs">GetUserAsync</a>(userId) -> WithRawResponseTask&lt;User&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.System.GetUserAsync("userId");
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

**userId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

