# Reference
## Headers
<details><summary><code>client.headers.<a href="/Sources/Resources/Headers/HeadersClient.swift">send</a>(request: Requests.SendLiteralsInHeadersRequest, requestOptions: RequestOptions?) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient()

    try await client.headers.send(request: .init(
        endpointVersion: .value,
        async: ,
        query: "What is the weather today"
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

**request:** `Requests.SendLiteralsInHeadersRequest` 
    
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

## Inlined
<details><summary><code>client.inlined.<a href="/Sources/Resources/Inlined/InlinedClient.swift">send</a>(request: Requests.SendLiteralsInlinedRequest, requestOptions: RequestOptions?) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient()

    try await client.inlined.send(request: .init(
        temperature: 10.1,
        prompt: .youAreAHelpfulAssistant,
        context: .youreSuperWise,
        aliasedContext: .youreSuperWise,
        maybeContext: .youreSuperWise,
        objectWithLiteral: ATopLevelLiteral(
            nestedLiteral: ANestedLiteral(
                myLiteral: .howSuperCool
            )
        ),
        stream: ,
        query: "What is the weather today"
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

**request:** `Requests.SendLiteralsInlinedRequest` 
    
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

## Path
<details><summary><code>client.path.<a href="/Sources/Resources/Path/PathClient.swift">send</a>(id: String, requestOptions: RequestOptions?) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient()

    try await client.path.send(id: .value)
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

**id:** `String` 
    
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

## Query
<details><summary><code>client.query.<a href="/Sources/Resources/Query/QueryClient.swift">send</a>(prompt: JSONValue, optionalPrompt: JSONValue?, aliasPrompt: AliasToPrompt, aliasOptionalPrompt: AliasToPrompt?, query: String, stream: JSONValue, optionalStream: JSONValue?, aliasStream: AliasToStream, aliasOptionalStream: AliasToStream?, requestOptions: RequestOptions?) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient()

    try await client.query.send(request: .init(
        prompt: .youAreAHelpfulAssistant,
        optionalPrompt: .youAreAHelpfulAssistant,
        aliasPrompt: .youAreAHelpfulAssistant,
        aliasOptionalPrompt: .youAreAHelpfulAssistant,
        stream: ,
        optionalStream: ,
        aliasStream: ,
        aliasOptionalStream: ,
        query: "What is the weather today"
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

**prompt:** `JSONValue` 
    
</dd>
</dl>

<dl>
<dd>

**optionalPrompt:** `JSONValue?` 
    
</dd>
</dl>

<dl>
<dd>

**aliasPrompt:** `AliasToPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**aliasOptionalPrompt:** `AliasToPrompt?` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**stream:** `JSONValue` 
    
</dd>
</dl>

<dl>
<dd>

**optionalStream:** `JSONValue?` 
    
</dd>
</dl>

<dl>
<dd>

**aliasStream:** `AliasToStream` 
    
</dd>
</dl>

<dl>
<dd>

**aliasOptionalStream:** `AliasToStream?` 
    
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

## Reference
<details><summary><code>client.reference.<a href="/Sources/Resources/Reference/ReferenceClient.swift">send</a>(request: SendRequest, requestOptions: RequestOptions?) -> SendResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient()

    try await client.reference.send(request: SendRequest(
        prompt: .youAreAHelpfulAssistant,
        stream: ,
        context: .youreSuperWise,
        query: "What is the weather today",
        containerObject: ContainerObject(
            nestedObjects: [
                NestedObjectWithLiterals(
                    literal1: .literal1,
                    literal2: .literal2,
                    strProp: "strProp"
                )
            ]
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

**request:** `SendRequest` 
    
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
