# Reference
## Products
<details><summary><code>$client-&gt;products-&gt;search($regionId, $request) -> ?SearchProductsResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->products->search(
    'regionId',
    new SearchProductsRequest([]),
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

**$regionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$query:** `?string` 
    
</dd>
</dl>

<dl>
<dd>

**$config:** `?SearchProductsRequestConfig` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>$client-&gt;products-&gt;get($regionId, $productId) -> ?Product</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```php
$client->products->get(
    'regionId',
    'productId',
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

**$regionId:** `string` 
    
</dd>
</dl>

<dl>
<dd>

**$productId:** `string` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

