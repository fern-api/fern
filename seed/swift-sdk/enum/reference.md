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
import Api

private func main() async throws {
    let client = ApiClient()

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

## Inlinedrequest
<details><summary><code>client.inlinedrequest.<a href="/Sources/Resources/Inlinedrequest/InlinedrequestClient.swift">send</a>(request: Requests.InlinedRequestSendRequest, requestOptions: RequestOptions?) -> Void</code></summary>
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

    _ = try await client.inlinedrequest.send(request: .init(
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

**request:** `Requests.InlinedRequestSendRequest` 
    
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

## Multipartform
<details><summary><code>client.multipartform.<a href="/Sources/Resources/Multipartform/MultipartformClient.swift">multipartform</a>(request: Requests.MultipartFormMultipartFormRequest, requestOptions: RequestOptions?) -> Void</code></summary>
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

    _ = try await client.multipartform.multipartform(request: .init())
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

**request:** `Requests.MultipartFormMultipartFormRequest` 
    
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

## Pathparam
<details><summary><code>client.pathparam.<a href="/Sources/Resources/Pathparam/PathparamClient.swift">send</a>(operand: String, operandOrColor: String, requestOptions: RequestOptions?) -> Void</code></summary>
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

    _ = try await client.pathparam.send(
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

## Queryparam
<details><summary><code>client.queryparam.<a href="/Sources/Resources/Queryparam/QueryparamClient.swift">send</a>(operand: Operand, maybeOperand: Operand?, operandOrColor: Color, maybeOperandOrColor: ColorOrOperand?, requestOptions: RequestOptions?) -> Void</code></summary>
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

    _ = try await client.queryparam.send(
        operand: .greaterThan,
        operandOrColor: .red
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

**operandOrColor:** `Color` 
    
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

<details><summary><code>client.queryparam.<a href="/Sources/Resources/Queryparam/QueryparamClient.swift">sendlist</a>(operand: Operand?, maybeOperand: Operand?, operandOrColor: ColorOrOperand?, maybeOperandOrColor: ColorOrOperand?, requestOptions: RequestOptions?) -> Void</code></summary>
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

    _ = try await client.queryparam.sendlist()
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

**operand:** `Operand?` 
    
</dd>
</dl>

<dl>
<dd>

**maybeOperand:** `Operand?` 
    
</dd>
</dl>

<dl>
<dd>

**operandOrColor:** `ColorOrOperand?` 
    
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

