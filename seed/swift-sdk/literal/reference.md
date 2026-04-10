# Reference
## Headers
<details><summary><code>client.headers.<a href="/Sources/Resources/Headers/HeadersClient.swift">send</a>(request: Requests.HeadersSendRequest, requestOptions: RequestOptions?) -> SendResponse</code></summary>
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

    _ = try await client.headers.send(request: .init(query: "query"))
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

**request:** `Requests.HeadersSendRequest` 
    
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
<details><summary><code>client.inlined.<a href="/Sources/Resources/Inlined/InlinedClient.swift">send</a>(request: Requests.InlinedSendRequest, requestOptions: RequestOptions?) -> SendResponse</code></summary>
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

    _ = try await client.inlined.send(request: .init(
        prompt: .youAreAHelpfulAssistant,
        query: "query",
        stream: true,
        aliasedContext: .youreSuperWise,
        objectWithLiteral: ATopLevelLiteral(
            nestedLiteral: ANestedLiteral(
                myLiteral: .howSuperCool
            )
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

**request:** `Requests.InlinedSendRequest` 
    
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
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.path.send(id: .oneHundredTwentyThree)
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
<details><summary><code>client.query.<a href="/Sources/Resources/Query/QueryClient.swift">send</a>(prompt: QuerySendRequestPrompt, optionalPrompt: Nullable&lt;QuerySendRequestOptionalPrompt&gt;?, aliasPrompt: AliasToPrompt, aliasOptionalPrompt: AliasToPrompt?, query: String, stream: Bool, optionalStream: Nullable&lt;Bool&gt;?, aliasStream: AliasToStream, aliasOptionalStream: AliasToStream?, requestOptions: RequestOptions?) -> SendResponse</code></summary>
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

    _ = try await client.query.send(
        prompt: .youAreAHelpfulAssistant,
        aliasPrompt: .youAreAHelpfulAssistant,
        query: "query",
        stream: true,
        aliasStream: true
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

**prompt:** `QuerySendRequestPrompt` 
    
</dd>
</dl>

<dl>
<dd>

**optionalPrompt:** `Nullable<QuerySendRequestOptionalPrompt>?` 
    
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

**stream:** `Bool` 
    
</dd>
</dl>

<dl>
<dd>

**optionalStream:** `Nullable<Bool>?` 
    
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
<details><summary><code>client.reference.<a href="/Sources/Resources/Reference/ReferenceClient.swift">send</a>(request: Requests.SendRequest, requestOptions: RequestOptions?) -> SendResponse</code></summary>
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

    _ = try await client.reference.send(request: .init(
        prompt: .youAreAHelpfulAssistant,
        query: "query",
        stream: true,
        ending: .ending,
        context: .youreSuperWise,
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

**request:** `Requests.SendRequest` 
    
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

