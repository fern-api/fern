# Reference
## Service
<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">getResource</a>(resourceId: String, requestOptions: RequestOptions?) -> Resource</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import MixedCase

private func main() async throws {
    let client = MixedCaseClient()

    _ = try await client.service.getResource(resourceId: "rsc-xyz")
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

**resourceId:** `String` 
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient.swift">listResources</a>(pageLimit: Int, beforeDate: CalendarDate, requestOptions: RequestOptions?) -> [Resource]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import MixedCase

private func main() async throws {
    let client = MixedCaseClient()

    _ = try await client.service.listResources(
        pageLimit: 10,
        beforeDate: CalendarDate("2023-01-01")!
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

**pageLimit:** `Int` 
    
</dd>
</dl>

<dl>
<dd>

**beforeDate:** `CalendarDate` 
    
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
