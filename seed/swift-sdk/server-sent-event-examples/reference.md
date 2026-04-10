# Reference
## Completions
<details><summary><code>client.completions.<a href="/Sources/Resources/Completions/CompletionsClient.swift">stream</a>(request: Requests.StreamCompletionRequest, requestOptions: RequestOptions?) -> JSONValue</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import ServerSentEvents

private func main() async throws {
    let client = ServerSentEventsClient()

    _ = try await client.completions.stream(request: .init(query: "foo"))
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

**request:** `Requests.StreamCompletionRequest` 
    
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

<details><summary><code>client.completions.<a href="/Sources/Resources/Completions/CompletionsClient.swift">streamEvents</a>(request: Requests.StreamEventsRequest, requestOptions: RequestOptions?) -> JSONValue</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import ServerSentEvents

private func main() async throws {
    let client = ServerSentEventsClient()

    _ = try await client.completions.streamEvents(request: .init(query: "query"))
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

**request:** `Requests.StreamEventsRequest` 
    
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

<details><summary><code>client.completions.<a href="/Sources/Resources/Completions/CompletionsClient.swift">streamEventsContextProtocol</a>(request: Requests.StreamEventsContextProtocolRequest, requestOptions: RequestOptions?) -> JSONValue</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import ServerSentEvents

private func main() async throws {
    let client = ServerSentEventsClient()

    _ = try await client.completions.streamEventsContextProtocol(request: .init(query: "query"))
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

**request:** `Requests.StreamEventsContextProtocolRequest` 
    
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

