# Reference
## Service
<details><summary><code>client.Service.<a href="/src/SeedMixedCase/Service/ServiceClient.cs">GetResourceAsync</a>(resourceId) -> SeedMixedCase.Resource</code></summary>
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

<details><summary><code>client.Service.<a href="/src/SeedMixedCase/Service/ServiceClient.cs">ListResourcesAsync</a>(SeedMixedCase.ListResourcesRequest { ... }) -> IEnumerable<SeedMixedCase.Resource></code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Service.ListResourcesAsync(
    new SeedMixedCase.ListResourcesRequest { PageLimit = 10, BeforeDate = new DateOnly(2023, 1, 1) }
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

**request:** `SeedMixedCase.ListResourcesRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
