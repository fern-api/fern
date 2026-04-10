# Reference
## Completions
<details><summary><code>client.completions.<a href="/Sources/Resources/Completions/CompletionsClient.swift">stream</a>(request: Requests.CompletionsStreamRequest, requestOptions: RequestOptions?) -> Data</code></summary>
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

    _ = try await client.completions.stream(request: .init(query: "query"))
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

**request:** `Requests.CompletionsStreamRequest` 
    
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

<details><summary><code>client.completions.<a href="/Sources/Resources/Completions/CompletionsClient.swift">streamevents</a>(request: Requests.CompletionsStreamEventsRequest, requestOptions: RequestOptions?) -> Data</code></summary>
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

    _ = try await client.completions.streamevents(request: .init(query: "query"))
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

**request:** `Requests.CompletionsStreamEventsRequest` 
    
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

<details><summary><code>client.completions.<a href="/Sources/Resources/Completions/CompletionsClient.swift">streameventscontextprotocol</a>(request: Requests.CompletionsStreamEventsContextProtocolRequest, requestOptions: RequestOptions?) -> Data</code></summary>
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

    _ = try await client.completions.streameventscontextprotocol(request: .init(query: "query"))
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

**request:** `Requests.CompletionsStreamEventsContextProtocolRequest` 
    
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

