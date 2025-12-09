# Reference
## Product
<details><summary><code>client.product.<a href="/src/api/resources/product/client/Client.ts">createProductVariantOption</a>({ ...params }) -> SeedTsBodyPropertyNameCollision.ProductVariantOption</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a product variant option. This endpoint tests the case where
a path parameter and body property have the same wire value but the
body property has an explicit name to disambiguate.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.product.createProductVariantOption({
    product_id: 1,
    createProductVariantOptionRequestProductId: 1,
    display_name: "display_name",
    sort_order: 1
});

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

**request:** `SeedTsBodyPropertyNameCollision.CreateProductVariantOptionRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `ProductClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
