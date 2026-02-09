# Reference
<details><summary><code>client.<a href="/src/SeedCsharpReadonlyRequest/SeedCsharpReadonlyRequestClient.cs">BatchCreateAsync</a>(CreateVendorRequest { ... }) -> WithRawResponseTask&lt;CreateVendorResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.BatchCreateAsync(
    new CreateVendorRequest
    {
        Vendors = new Dictionary<string, Vendor>()
        {
            {
                "vendor-1",
                new Vendor
                {
                    Id = "vendor-1",
                    Name = "Acme Corp",
                    CreatedAt = "2024-01-01T00:00:00Z",
                    UpdatedAt = "2024-01-01T00:00:00Z",
                }
            },
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

**request:** `CreateVendorRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
