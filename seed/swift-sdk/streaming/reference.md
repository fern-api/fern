# Reference
## Dummy
<details><summary><code>client.dummy.<a href="/Sources/Resources/Dummy/DummyClient.swift">generateStream</a>(request: Requests.GenerateStreamRequest, requestOptions: RequestOptions?) -> JSONValue</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Streaming

private func main() async throws {
    let client = StreamingClient()

    _ = try await client.dummy.generateStream(request: .init(numEvents: 1))
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

**request:** `Requests.GenerateStreamRequest` 
    
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

<details><summary><code>client.dummy.<a href="/Sources/Resources/Dummy/DummyClient.swift">generate</a>(request: Requests.Generateequest, requestOptions: RequestOptions?) -> StreamResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Streaming

private func main() async throws {
    let client = StreamingClient()

    _ = try await client.dummy.generate(request: .init(numEvents: 5))
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

**request:** `Requests.Generateequest` 
    
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
