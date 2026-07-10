# Reference
## Products
<details><summary><code>client.products.search(regionId, request) -> SearchProductsResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.products().search(
    "regionId",
    SearchProductsRequest
        .builder()
        .build()
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

**regionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `Optional<String>` 
    
</dd>
</dl>

<dl>
<dd>

**config:** `Optional<SearchProductsRequestConfig>` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.products.get(regionId, productId) -> Product</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```java
client.products().get(
    "regionId",
    "productId",
    GetProductsRequest
        .builder()
        .build()
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

**regionId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**productId:** `String` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

