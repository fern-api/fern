# Reference
## TestGroup
<details><summary><code>client.testGroup.<a href="/Sources/Resources/TestGroup/TestGroupClient.swift">testMethodName</a>(pathParam: String, queryParamObject: Nullable&lt;PlainObject&gt;?, queryParamInteger: Nullable&lt;Int&gt;?, request: Nullable&lt;PlainObject&gt;, requestOptions: RequestOptions?) -> JSONValue</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Post a nullable request body
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
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.testGroup.testMethodName(
        pathParam: "path_param",
        request: .value(PlainObject(

        ))
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

**pathParam:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**queryParamObject:** `Nullable<PlainObject>?` 
    
</dd>
</dl>

<dl>
<dd>

**queryParamInteger:** `Nullable<Int>?` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `Nullable<PlainObject>` 
    
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

