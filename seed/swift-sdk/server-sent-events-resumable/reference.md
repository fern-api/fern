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
import ServerSentEventsResumable

private func main() async throws {
    let client = ServerSentEventsResumableClient()

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

<details><summary><code>client.completions.<a href="/Sources/Resources/Completions/CompletionsClient.swift">streamNonResumable</a>(request: Requests.StreamCompletionRequestNonResumable, requestOptions: RequestOptions?) -> JSONValue</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import ServerSentEventsResumable

private func main() async throws {
    let client = ServerSentEventsResumableClient()

    _ = try await client.completions.streamNonResumable(request: .init(query: "bar"))
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

**request:** `Requests.StreamCompletionRequestNonResumable` 
    
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

