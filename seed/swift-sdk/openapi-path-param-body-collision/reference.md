# Reference
<details><summary><code>client.<a href="/Sources/ApiClient.swift">updateProfileIdentifier</a>(profileId: String, idTypePathParam: String, request: Requests.IdentifierUpdate, requestOptions: RequestOptions?) -> UpdateProfileIdentifierResponse</code></summary>
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

    _ = try await client.updateProfileIdentifier(
        profileId: "profile_123",
        idTypePathParam: "email",
        request: .init(
            idType: "phone",
            oldValue: "+13175556789",
            newValue: "+13175556798"
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

**profileId:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**idTypePathParam:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Requests.IdentifierUpdate` 
    
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

