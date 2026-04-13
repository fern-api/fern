# Reference
## _
<details><summary><code>client._.<a href="/src/SeedApi/_/Client.cs">BatchCreateAsync</a>(CreateVendorRequest { ... }) -> WithRawResponseTask&lt;CreateVendorResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client._.BatchCreateAsync(
    new CreateVendorRequest
    {
        Vendors = new Dictionary<string, Vendor>()
        {
            {
                "key",
                new Vendor
                {
                    Id = "id",
                    Name = "name",
                    CreatedAt = "created_at",
                    UpdatedAt = "updated_at",
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

