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
        NormalSweet(
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
            NormalSweet(
                value: "value"
            )
        ),
        BigUnion.normalSweet(
            NormalSweet(
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

## Types
<details><summary><code>client.types.<a href="/Sources/Resources/Types/TypesClient.swift">get</a>(id: String, requestOptions: RequestOptions?) -> UnionWithTime</code></summary>
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

    _ = try await client.types.get(id: "date-example")
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

<details><summary><code>client.types.<a href="/Sources/Resources/Types/TypesClient.swift">update</a>(request: UnionWithTime, requestOptions: RequestOptions?) -> Bool</code></summary>
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

    _ = try await client.types.update(request: UnionWithTime.date(

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

**request:** `UnionWithTime` 
    
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
        Circle(
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

