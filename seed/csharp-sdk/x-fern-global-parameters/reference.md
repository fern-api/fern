# Reference
## Products
<details><summary><code>client.Products.<a href="/src/SeedApi/Products/ProductsClient.cs">SearchAsync</a>(SearchProductsRequest { ... }) -> WithRawResponseTask&lt;SearchProductsResponse&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Products.SearchAsync(new SearchProductsRequest { RegionId = "regionId" });
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

**request:** `SearchProductsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Products.<a href="/src/SeedApi/Products/ProductsClient.cs">GetAsync</a>(GetProductsRequest { ... }) -> WithRawResponseTask&lt;Product&gt;</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```csharp
await client.Products.GetAsync(
    new GetProductsRequest { RegionId = "regionId", ProductId = "productId" }
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

**request:** `GetProductsRequest` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

