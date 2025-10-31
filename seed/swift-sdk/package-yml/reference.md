# Reference
<details><summary><code>client.<a href="/Sources/PackageYmlClient.swift">echo</a>(id: String, request: EchoRequest, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import PackageYml

private func main() async throws {
    let client = PackageYmlClient()

    _ = try await client.echo(
        id: "id-ksfd9c1",
        request: EchoRequest(
            name: "Hello world!",
            size: 20
        )
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `EchoRequest` 
    
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

## Service
<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">nop</a>(id: String, nestedId: String, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import PackageYml

private func main() async throws {
    let client = PackageYmlClient()

    _ = try await client.service.nop(
        id: "id-a2ijs82",
        nestedId: "id-219xca8"
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**nestedId:** `String` 
    
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

