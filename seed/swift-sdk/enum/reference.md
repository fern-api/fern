# Reference
## Headers
<details><summary><code>client.headers.<a href="/Sources/Resources/Headers/HeadersClient.swift">send</a>(requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Enum

private func main() async throws {
    let client = EnumClient()

    _ = try await client.headers.send()
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

## InlinedRequest
<details><summary><code>client.inlinedRequest.<a href="/Sources/Resources/InlinedRequest/InlinedRequestClient.swift">send</a>(request: Requests.SendEnumInlinedRequest, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Enum

private func main() async throws {
    let client = EnumClient()

    _ = try await client.inlinedRequest.send(request: .init(
        operand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
        )
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

**request:** `Requests.SendEnumInlinedRequest` 
    
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

## PathParam
<details><summary><code>client.pathParam.<a href="/Sources/Resources/PathParam/PathParamClient.swift">send</a>(operand: String, operandOrColor: String, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Enum

private func main() async throws {
    let client = EnumClient()

    _ = try await client.pathParam.send(
        operand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
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

**operand:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `String` 
    
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

## QueryParam
<details><summary><code>client.queryParam.<a href="/Sources/Resources/QueryParam/QueryParamClient.swift">send</a>(operand: Operand, maybeOperand: Operand?, operandOrColor: ColorOrOperand, maybeOperandOrColor: ColorOrOperand?, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Enum

private func main() async throws {
    let client = EnumClient()

    _ = try await client.queryParam.send(
        operand: .greaterThan,
        operandOrColor: ColorOrOperand.color(
            .red
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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperand:** `Operand?` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperandOrColor:** `ColorOrOperand?` 
    
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

<details><summary><code>client.queryParam.<a href="/Sources/Resources/QueryParam/QueryParamClient.swift">sendList</a>(operand: Operand, maybeOperand: Operand?, operandOrColor: ColorOrOperand, maybeOperandOrColor: ColorOrOperand?, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Enum

private func main() async throws {
    let client = EnumClient()

    _ = try await client.queryParam.sendList()
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

**operand:** `Operand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperand:** `Operand?` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `ColorOrOperand` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperandOrColor:** `ColorOrOperand?` 
    
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

