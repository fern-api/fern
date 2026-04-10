# Reference
## FolderA Service
<details><summary><code>client.folderA.service.<a href="/Sources/Resources/FolderA/Service/ServiceClient.swift">getDirectThread</a>(ids: String, tags: String, requestOptions: RequestOptions?) -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Audiences

private func main() async throws {
    let client = AudiencesClient()

    _ = try await client.folderA.service.getDirectThread()
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

**ids:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `String` 
    
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

## FolderD Service
<details><summary><code>client.folderD.service.<a href="/Sources/Resources/FolderD/Service/FolderDServiceClient.swift">getDirectThread</a>(requestOptions: RequestOptions?) -> ResponseType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Audiences

private func main() async throws {
    let client = AudiencesClient()

    _ = try await client.folderD.service.getDirectThread()
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

**requestOptions:** `RequestOptions?` — Additional options for configuring the request, such as custom headers or timeout settings.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Foo
<details><summary><code>client.foo.<a href="/Sources/Resources/Foo/FooClient.swift">find</a>(optionalString: OptionalString, request: Requests.FindRequest, requestOptions: RequestOptions?) -> ImportingType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Audiences

private func main() async throws {
    let client = AudiencesClient()

    _ = try await client.foo.find(
        optionalString: "optionalString",
        request: .init(
            publicProperty: "publicProperty",
            privateProperty: 1
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

**optionalString:** `OptionalString` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.FindRequest` 
    
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

