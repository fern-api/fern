# Reference
## Products
<details><summary><code>client.products.<a href="/Sources/Resources/Products/ProductsClient.swift">search</a>(regionId: String, request: Requests.SearchProductsRequest, requestOptions: RequestOptions?) -> SearchProductsResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.products.search(
        regionId: "regionId",
        request: .init()
    )
}

try await main()
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

**request:** `Requests.SearchProductsRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.products.<a href="/Sources/Resources/Products/ProductsClient.swift">get</a>(regionId: String, productId: String, requestOptions: RequestOptions?) -> Product</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.products.get(
        regionId: "regionId",
        productId: "productId"
    )
}

try await main()
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

<dl>
<dd>

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

