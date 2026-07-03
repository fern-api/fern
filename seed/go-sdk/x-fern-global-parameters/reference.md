# Reference
## Products
<details><summary><code>client.Products.Search(RegionID, request) -> *fern.SearchProductsResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.SearchProductsRequest{
        RegionID: "regionId",
    }
client.Products.Search(
        context.TODO(),
        request,
    )
}
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

**regionID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `*string` 
    
</dd>
</dl>

<dl>
<dd>

**config:** `*fern.SearchProductsRequestConfig` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.Products.Get(RegionID, ProductID) -> *fern.Product</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```go
request := &fern.GetProductsRequest{
        RegionID: "regionId",
        ProductID: "productId",
    }
client.Products.Get(
        context.TODO(),
        request,
    )
}
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

**regionID:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**productID:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

