# Reference
<details><summary><code>client.<a href="/Sources/ApiClient.swift">createPlantOrder</a>(plantId: String, request: PlantOrder, requestOptions: RequestOptions?) -> PlantOrder</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates an order for a plant.
</dd>
</dl>
</dd>
</dl>

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

    _ = try await client.createPlantOrder(
        plantId: "plantId",
        request: .init(body: PlantOrder(
            orderId: "orderId",
            amount: 1.1,
            currency: "currency",
            plantName: "plantName"
        ))
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

**plantId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `PlantOrder` 
    
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

