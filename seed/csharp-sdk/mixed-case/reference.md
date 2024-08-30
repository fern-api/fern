# Reference
## Service
<details><summary><code>client.Service.<a href="/src/SeedMixedCase/Service/ServiceClient.cs">GetResourceAsync</a>(resourceId) -> object</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.GetResourceAsync("rsc-xyz");
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

**resourceId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Service.<a href="/src/SeedMixedCase/Service/ServiceClient.cs">ListResourcesAsync</a>(ListResourcesRequest { ... }) -> IEnumerable<object></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.ListResourcesAsync(
    new ListResourcesRequest { PageLimit = 10, BeforeDate = new DateOnly(2023, 1, 1) }
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

**request:** `ListResourcesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
