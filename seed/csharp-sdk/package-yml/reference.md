# Reference
## _
<details><summary><code>client._.<a href="/src/SeedApi/_/Client.cs">EchoAsync</a>(EchoRequest { ... }) -> WithRawResponseTask&lt;string&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client._.EchoAsync(
    new EchoRequest
    {
        Id = "id",
        Name = "name",
        Size = 1,
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

**request:** `EchoRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Service
<details><summary><code>client.Service.<a href="/src/SeedApi/Service/ServiceClient.cs">NopAsync</a>(ServiceNopRequest { ... })</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.NopAsync(new ServiceNopRequest { Id = "id", NestedId = "nestedId" });
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

**request:** `ServiceNopRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

