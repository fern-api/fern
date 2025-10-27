# Reference
## Bigunion
<details><summary><code>client.bigunion.<a href="/Sources/Resources/Bigunion/BigunionClient.swift">get</a>(id: String, requestOptions: RequestOptions?) -> BigUnion</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient()

    _ = try await client.bigunion.get(id: "id")
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

**id:** `String` 
    
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

<details><summary><code>client.bigunion.<a href="/Sources/Resources/Bigunion/BigunionClient.swift">update</a>(request: BigUnion, requestOptions: RequestOptions?) -> Bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient()

    _ = try await client.bigunion.update(request: BigUnion.normalSweet(
        .init(
            id: "id",
            createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            archivedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            value: "value"
        )
    ))
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

**request:** `BigUnion` 
    
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

<details><summary><code>client.bigunion.<a href="/Sources/Resources/Bigunion/BigunionClient.swift">updateMany</a>(request: [BigUnion], requestOptions: RequestOptions?) -> [String: Bool]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient()

    _ = try await client.bigunion.updateMany(request: [
        BigUnion.normalSweet(
            .init(
                id: "id",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                archivedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                value: "value"
            )
        ),
        BigUnion.normalSweet(
            .init(
                id: "id",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                archivedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                value: "value"
            )
        )
    ])
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

**request:** `[BigUnion]` 
    
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

## Union
<details><summary><code>client.union.<a href="/Sources/Resources/Union/UnionClient.swift">get</a>(id: String, requestOptions: RequestOptions?) -> Shape</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient()

    _ = try await client.bigunion.get(id: "id")
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

**id:** `String` 
    
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

<details><summary><code>client.union.<a href="/Sources/Resources/Union/UnionClient.swift">update</a>(request: Shape, requestOptions: RequestOptions?) -> Bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient()

    _ = try await client.union.update(request: Shape.circle(
        .init(
            id: "id",
            radius: 1.1
        )
    ))
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

**request:** `Shape` 
    
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

