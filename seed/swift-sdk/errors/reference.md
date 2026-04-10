# Reference
## Simple
<details><summary><code>client.simple.<a href="/Sources/Resources/Simple/SimpleClient.swift">fooWithoutEndpointError</a>(request: FooRequest, requestOptions: RequestOptions?) -> FooResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Errors

private func main() async throws {
    let client = ErrorsClient()

    _ = try await client.simple.fooWithoutEndpointError(request: FooRequest(
        bar: "bar"
    ))
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

**request:** `FooRequest` 
    
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

<details><summary><code>client.simple.<a href="/Sources/Resources/Simple/SimpleClient.swift">foo</a>(request: FooRequest, requestOptions: RequestOptions?) -> FooResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Errors

private func main() async throws {
    let client = ErrorsClient()

    _ = try await client.simple.foo(request: FooRequest(
        bar: "bar"
    ))
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

**request:** `FooRequest` 
    
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

<details><summary><code>client.simple.<a href="/Sources/Resources/Simple/SimpleClient.swift">fooWithExamples</a>(request: FooRequest, requestOptions: RequestOptions?) -> FooResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Errors

private func main() async throws {
    let client = ErrorsClient()

    _ = try await client.simple.fooWithExamples(request: FooRequest(
        bar: "hello"
    ))
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

**request:** `FooRequest` 
    
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

