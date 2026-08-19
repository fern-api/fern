# Reference
## Status
<details><summary><code>client.status.<a href="/Sources/Resources/Status/StatusClient.swift">getStatus</a>(requestOptions: RequestOptions?) -> StatusResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Websocket

private func main() async throws {
    let client = WebsocketClient()

    _ = try await client.status.getStatus()
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

