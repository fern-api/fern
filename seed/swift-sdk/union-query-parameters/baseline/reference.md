# Reference
## Events
<details><summary><code>client.events.<a href="/Sources/Resources/Events/EventsClient.swift">subscribe</a>(eventType: EventTypeParam?, tags: StringOrListParam?, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Subscribe to events with a oneOf-style query parameter that may be a
scalar enum value or a list of enum values.
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
import UnionQueryParameters

private func main() async throws {
    let client = UnionQueryParametersClient()

    _ = try await client.events.subscribe(
        eventType: EventTypeParam.eventTypeEnum(
            .groupCreated
        ),
        tags: StringOrListParam.string(
            "tags"
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

**eventType:** `EventTypeParam?` 
    
</dd>
</dl>

<dl>
<dd>

**tags:** `StringOrListParam?` 
    
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

