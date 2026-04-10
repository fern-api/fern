# Reference
## EndpointsContainer
<details><summary><code>client.endpointsContainer.<a href="/Sources/Resources/EndpointsContainer/EndpointsContainerClient.swift">endpointsContainerGetAndReturnListOfPrimitives</a>(request: [String], requestOptions: RequestOptions?) -> [String]</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsContainer.endpointsContainerGetAndReturnListOfPrimitives(request: [
        "string"
    ])
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

**request:** `[String]` 
    
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

<details><summary><code>client.endpointsContainer.<a href="/Sources/Resources/EndpointsContainer/EndpointsContainerClient.swift">endpointsContainerGetAndReturnListOfObjects</a>(request: [TypesObjectWithRequiredField], requestOptions: RequestOptions?) -> [TypesObjectWithRequiredField]</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsContainer.endpointsContainerGetAndReturnListOfObjects(request: [
        TypesObjectWithRequiredField(
            string: "string"
        )
    ])
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

**request:** `[TypesObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpointsContainer.<a href="/Sources/Resources/EndpointsContainer/EndpointsContainerClient.swift">endpointsContainerGetAndReturnSetOfPrimitives</a>(request: [String], requestOptions: RequestOptions?) -> [String]</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsContainer.endpointsContainerGetAndReturnSetOfPrimitives(request: [
        "string"
    ])
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

**request:** `[String]` 
    
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

<details><summary><code>client.endpointsContainer.<a href="/Sources/Resources/EndpointsContainer/EndpointsContainerClient.swift">endpointsContainerGetAndReturnSetOfObjects</a>(request: [TypesObjectWithRequiredField], requestOptions: RequestOptions?) -> [TypesObjectWithRequiredField]</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsContainer.endpointsContainerGetAndReturnSetOfObjects(request: [
        TypesObjectWithRequiredField(
            string: "string"
        )
    ])
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

**request:** `[TypesObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpointsContainer.<a href="/Sources/Resources/EndpointsContainer/EndpointsContainerClient.swift">endpointsContainerGetAndReturnMapPrimToPrim</a>(request: [String: String], requestOptions: RequestOptions?) -> [String: String]</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsContainer.endpointsContainerGetAndReturnMapPrimToPrim(request: [
        "key": "value"
    ])
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

**request:** `[String: String]` 
    
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

<details><summary><code>client.endpointsContainer.<a href="/Sources/Resources/EndpointsContainer/EndpointsContainerClient.swift">endpointsContainerGetAndReturnMapOfPrimToObject</a>(request: [String: TypesObjectWithRequiredField], requestOptions: RequestOptions?) -> [String: TypesObjectWithRequiredField]</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsContainer.endpointsContainerGetAndReturnMapOfPrimToObject(request: [
        "key": TypesObjectWithRequiredField(
            string: "string"
        )
    ])
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

**request:** `[String: TypesObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpointsContainer.<a href="/Sources/Resources/EndpointsContainer/EndpointsContainerClient.swift">endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion</a>(request: [String: TypesMixedType], requestOptions: RequestOptions?) -> [String: TypesMixedType]</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsContainer.endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(request: [
        "key": TypesMixedType.double(
            1.1
        )
    ])
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

**request:** `[String: TypesMixedType]` 
    
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

<details><summary><code>client.endpointsContainer.<a href="/Sources/Resources/EndpointsContainer/EndpointsContainerClient.swift">endpointsContainerGetAndReturnOptional</a>(request: TypesObjectWithRequiredField, requestOptions: RequestOptions?) -> TypesObjectWithRequiredField</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsContainer.endpointsContainerGetAndReturnOptional(request: TypesObjectWithRequiredField(
        string: "string"
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

**request:** `TypesObjectWithRequiredField` 
    
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

## EndpointsContentType
<details><summary><code>client.endpointsContentType.<a href="/Sources/Resources/EndpointsContentType/EndpointsContentTypeClient.swift">endpointsContentTypePostJsonPatchContentType</a>(request: TypesObjectWithOptionalField, requestOptions: RequestOptions?) -> Void</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsContentType.endpointsContentTypePostJsonPatchContentType(request: TypesObjectWithOptionalField(

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

**request:** `TypesObjectWithOptionalField` 
    
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

<details><summary><code>client.endpointsContentType.<a href="/Sources/Resources/EndpointsContentType/EndpointsContentTypeClient.swift">endpointsContentTypePostJsonPatchContentWithCharsetType</a>(request: TypesObjectWithOptionalField, requestOptions: RequestOptions?) -> Void</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsContentType.endpointsContentTypePostJsonPatchContentWithCharsetType(request: TypesObjectWithOptionalField(

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

**request:** `TypesObjectWithOptionalField` 
    
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

## EndpointsEnum
<details><summary><code>client.endpointsEnum.<a href="/Sources/Resources/EndpointsEnum/EndpointsEnumClient.swift">endpointsEnumGetAndReturnEnum</a>(request: TypesWeatherReport, requestOptions: RequestOptions?) -> TypesWeatherReport</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsEnum.endpointsEnumGetAndReturnEnum(request: .sunny)
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

**request:** `TypesWeatherReport` 
    
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

## EndpointsHttpMethods
<details><summary><code>client.endpointsHttpMethods.<a href="/Sources/Resources/EndpointsHttpMethods/EndpointsHttpMethodsClient.swift">endpointsHttpMethodsTestGet</a>(id: String, requestOptions: RequestOptions?) -> String</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsHttpMethods.endpointsHttpMethodsTestGet(id: "id")
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

<details><summary><code>client.endpointsHttpMethods.<a href="/Sources/Resources/EndpointsHttpMethods/EndpointsHttpMethodsClient.swift">endpointsHttpMethodsTestPut</a>(id: String, request: TypesObjectWithRequiredField, requestOptions: RequestOptions?) -> TypesObjectWithOptionalField</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsHttpMethods.endpointsHttpMethodsTestPut(
        id: "id",
        request: .init(body: TypesObjectWithRequiredField(
            string: "string"
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TypesObjectWithRequiredField` 
    
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

<details><summary><code>client.endpointsHttpMethods.<a href="/Sources/Resources/EndpointsHttpMethods/EndpointsHttpMethodsClient.swift">endpointsHttpMethodsTestDelete</a>(id: String, requestOptions: RequestOptions?) -> Bool</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsHttpMethods.endpointsHttpMethodsTestDelete(id: "id")
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

<details><summary><code>client.endpointsHttpMethods.<a href="/Sources/Resources/EndpointsHttpMethods/EndpointsHttpMethodsClient.swift">endpointsHttpMethodsTestPatch</a>(id: String, request: TypesObjectWithOptionalField, requestOptions: RequestOptions?) -> TypesObjectWithOptionalField</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsHttpMethods.endpointsHttpMethodsTestPatch(
        id: "id",
        request: .init(body: TypesObjectWithOptionalField(

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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TypesObjectWithOptionalField` 
    
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

<details><summary><code>client.endpointsHttpMethods.<a href="/Sources/Resources/EndpointsHttpMethods/EndpointsHttpMethodsClient.swift">endpointsHttpMethodsTestPost</a>(request: TypesObjectWithRequiredField, requestOptions: RequestOptions?) -> TypesObjectWithOptionalField</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsHttpMethods.endpointsHttpMethodsTestPost(request: TypesObjectWithRequiredField(
        string: "string"
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

**request:** `TypesObjectWithRequiredField` 
    
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

## EndpointsObject
<details><summary><code>client.endpointsObject.<a href="/Sources/Resources/EndpointsObject/EndpointsObjectClient.swift">endpointsObjectGetAndReturnWithOptionalField</a>(request: TypesObjectWithOptionalField, requestOptions: RequestOptions?) -> TypesObjectWithOptionalField</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnWithOptionalField(request: TypesObjectWithOptionalField(

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

**request:** `TypesObjectWithOptionalField` 
    
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

<details><summary><code>client.endpointsObject.<a href="/Sources/Resources/EndpointsObject/EndpointsObjectClient.swift">endpointsObjectGetAndReturnWithRequiredField</a>(request: TypesObjectWithRequiredField, requestOptions: RequestOptions?) -> TypesObjectWithRequiredField</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnWithRequiredField(request: TypesObjectWithRequiredField(
        string: "string"
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

**request:** `TypesObjectWithRequiredField` 
    
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

<details><summary><code>client.endpointsObject.<a href="/Sources/Resources/EndpointsObject/EndpointsObjectClient.swift">endpointsObjectGetAndReturnWithMapOfMap</a>(request: TypesObjectWithMapOfMap, requestOptions: RequestOptions?) -> TypesObjectWithMapOfMap</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnWithMapOfMap(request: TypesObjectWithMapOfMap(
        map: [
            "key": [
                "key": "value"
            ]
        ]
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

**request:** `TypesObjectWithMapOfMap` 
    
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

<details><summary><code>client.endpointsObject.<a href="/Sources/Resources/EndpointsObject/EndpointsObjectClient.swift">endpointsObjectGetAndReturnNestedWithOptionalField</a>(request: TypesNestedObjectWithOptionalField, requestOptions: RequestOptions?) -> TypesNestedObjectWithOptionalField</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnNestedWithOptionalField(request: TypesNestedObjectWithOptionalField(

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

**request:** `TypesNestedObjectWithOptionalField` 
    
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

<details><summary><code>client.endpointsObject.<a href="/Sources/Resources/EndpointsObject/EndpointsObjectClient.swift">endpointsObjectGetAndReturnNestedWithRequiredField</a>(string: String, request: TypesNestedObjectWithRequiredField, requestOptions: RequestOptions?) -> TypesNestedObjectWithRequiredField</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnNestedWithRequiredField(
        string: "string",
        request: .init(body: TypesNestedObjectWithRequiredField(
            string: "string",
            nestedObject: TypesObjectWithOptionalField(

            )
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

**string:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `TypesNestedObjectWithRequiredField` 
    
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

<details><summary><code>client.endpointsObject.<a href="/Sources/Resources/EndpointsObject/EndpointsObjectClient.swift">endpointsObjectGetAndReturnNestedWithRequiredFieldAsList</a>(request: [TypesNestedObjectWithRequiredField], requestOptions: RequestOptions?) -> TypesNestedObjectWithRequiredField</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnNestedWithRequiredFieldAsList(request: [
        TypesNestedObjectWithRequiredField(
            string: "string",
            nestedObject: TypesObjectWithOptionalField(

            )
        )
    ])
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

**request:** `[TypesNestedObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpointsObject.<a href="/Sources/Resources/EndpointsObject/EndpointsObjectClient.swift">endpointsObjectGetAndReturnWithUnknownField</a>(request: TypesObjectWithUnknownField, requestOptions: RequestOptions?) -> TypesObjectWithUnknownField</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnWithUnknownField(request: TypesObjectWithUnknownField(
        unknown: .object([
            "key": .string("value")
        ])
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

**request:** `TypesObjectWithUnknownField` 
    
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

<details><summary><code>client.endpointsObject.<a href="/Sources/Resources/EndpointsObject/EndpointsObjectClient.swift">endpointsObjectGetAndReturnWithDocumentedUnknownType</a>(request: TypesObjectWithDocumentedUnknownType, requestOptions: RequestOptions?) -> TypesObjectWithDocumentedUnknownType</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnWithDocumentedUnknownType(request: TypesObjectWithDocumentedUnknownType(
        documentedUnknownType: .object([
            "key": .string("value")
        ])
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

**request:** `TypesObjectWithDocumentedUnknownType` 
    
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

<details><summary><code>client.endpointsObject.<a href="/Sources/Resources/EndpointsObject/EndpointsObjectClient.swift">endpointsObjectGetAndReturnMapOfDocumentedUnknownType</a>(request: TypesMapOfDocumentedUnknownType, requestOptions: RequestOptions?) -> TypesMapOfDocumentedUnknownType</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnMapOfDocumentedUnknownType(request: [:])
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

**request:** `TypesMapOfDocumentedUnknownType` 
    
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

<details><summary><code>client.endpointsObject.<a href="/Sources/Resources/EndpointsObject/EndpointsObjectClient.swift">endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields</a>(request: TypesObjectWithMixedRequiredAndOptionalFields, requestOptions: RequestOptions?) -> TypesObjectWithMixedRequiredAndOptionalFields</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that dynamic snippets include all required properties in the
object initializer, even when the example omits some required fields.
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(request: TypesObjectWithMixedRequiredAndOptionalFields(
        requiredString: "requiredString",
        requiredInteger: 1,
        requiredLong: 1000000
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

**request:** `TypesObjectWithMixedRequiredAndOptionalFields` 
    
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

<details><summary><code>client.endpointsObject.<a href="/Sources/Resources/EndpointsObject/EndpointsObjectClient.swift">endpointsObjectGetAndReturnWithRequiredNestedObject</a>(request: TypesObjectWithRequiredNestedObject, requestOptions: RequestOptions?) -> TypesObjectWithRequiredNestedObject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that dynamic snippets recursively construct default objects for
required properties whose type is a named object. When the example
omits the nested object, the generator should construct a default
initializer with the nested object's required properties filled in.
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnWithRequiredNestedObject(request: TypesObjectWithRequiredNestedObject(
        requiredString: "requiredString",
        requiredObject: TypesNestedObjectWithRequiredField(
            string: "string",
            nestedObject: TypesObjectWithOptionalField(

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

**request:** `TypesObjectWithRequiredNestedObject` 
    
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

<details><summary><code>client.endpointsObject.<a href="/Sources/Resources/EndpointsObject/EndpointsObjectClient.swift">endpointsObjectGetAndReturnWithDatetimeLikeString</a>(request: TypesObjectWithDatetimeLikeString, requestOptions: RequestOptions?) -> TypesObjectWithDatetimeLikeString</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Tests that string fields containing datetime-like values are NOT reformatted.
The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
without being converted to "2023-08-31T14:15:22.000Z".
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnWithDatetimeLikeString(request: TypesObjectWithDatetimeLikeString(
        datetimeLikeString: "datetimeLikeString",
        actualDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
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

**request:** `TypesObjectWithDatetimeLikeString` 
    
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

## EndpointsPagination
<details><summary><code>client.endpointsPagination.<a href="/Sources/Resources/EndpointsPagination/EndpointsPaginationClient.swift">endpointsPaginationListItems</a>(cursor: Nullable&lt;String&gt;?, limit: Nullable&lt;Int&gt;?, requestOptions: RequestOptions?) -> EndpointsPaginatedResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

List items with cursor pagination
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsPagination.endpointsPaginationListItems()
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

**cursor:** `Nullable<String>?` — The cursor for pagination
    
</dd>
</dl>

<dl>
<dd>

**limit:** `Nullable<Int>?` — Maximum number of items to return
    
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

## EndpointsParams
<details><summary><code>client.endpointsParams.<a href="/Sources/Resources/EndpointsParams/EndpointsParamsClient.swift">endpointsParamsGetWithPath</a>(param: String, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsParams.endpointsParamsGetWithPath(param: "param")
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

**param:** `String` 
    
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

<details><summary><code>client.endpointsParams.<a href="/Sources/Resources/EndpointsParams/EndpointsParamsClient.swift">endpointsParamsModifyWithPath</a>(param: String, request: String, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsParams.endpointsParamsModifyWithPath(
        param: "param",
        request: .init(body: "string")
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `String` 
    
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

<details><summary><code>client.endpointsParams.<a href="/Sources/Resources/EndpointsParams/EndpointsParamsClient.swift">endpointsParamsGetWithInlinePath</a>(param: String, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsParams.endpointsParamsGetWithInlinePath(param: "param")
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

**param:** `String` 
    
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

<details><summary><code>client.endpointsParams.<a href="/Sources/Resources/EndpointsParams/EndpointsParamsClient.swift">endpointsParamsModifyWithInlinePath</a>(param: String, request: String, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

PUT to update with path param
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsParams.endpointsParamsModifyWithInlinePath(
        param: "param",
        request: .init(body: "string")
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `String` 
    
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

<details><summary><code>client.endpointsParams.<a href="/Sources/Resources/EndpointsParams/EndpointsParamsClient.swift">endpointsParamsGetWithQuery</a>(query: String, number: Int, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with query param
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsParams.endpointsParamsGetWithQuery(
        query: "query",
        number: 1
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

**query:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `Int` 
    
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

<details><summary><code>client.endpointsParams.<a href="/Sources/Resources/EndpointsParams/EndpointsParamsClient.swift">endpointsParamsGetWithAllowMultipleQuery</a>(query: String?, number: Int?, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with multiple of same query param
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsParams.endpointsParamsGetWithAllowMultipleQuery()
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

**query:** `String?` 
    
</dd>
</dl>

<dl>
<dd>

**number:** `Int?` 
    
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

<details><summary><code>client.endpointsParams.<a href="/Sources/Resources/EndpointsParams/EndpointsParamsClient.swift">endpointsParamsGetWithPathAndQuery</a>(param: String, query: String, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsParams.endpointsParamsGetWithPathAndQuery(
        param: "param",
        query: "query"
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
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

<details><summary><code>client.endpointsParams.<a href="/Sources/Resources/EndpointsParams/EndpointsParamsClient.swift">endpointsParamsGetWithInlinePathAndQuery</a>(param: String, query: String, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path and query params
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsParams.endpointsParamsGetWithInlinePathAndQuery(
        param: "param",
        query: "query"
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

**param:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**query:** `String` 
    
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

<details><summary><code>client.endpointsParams.<a href="/Sources/Resources/EndpointsParams/EndpointsParamsClient.swift">endpointsParamsGetWithBooleanPath</a>(param: String, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with boolean path param
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsParams.endpointsParamsGetWithBooleanPath(param: true)
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

**param:** `String` 
    
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

<details><summary><code>client.endpointsParams.<a href="/Sources/Resources/EndpointsParams/EndpointsParamsClient.swift">endpointsParamsGetWithPathAndErrors</a>(param: String, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

GET with path param that can throw errors
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsParams.endpointsParamsGetWithPathAndErrors(param: "param")
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

**param:** `String` 
    
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

## EndpointsPrimitive
<details><summary><code>client.endpointsPrimitive.<a href="/Sources/Resources/EndpointsPrimitive/EndpointsPrimitiveClient.swift">endpointsPrimitiveGetAndReturnString</a>(request: String, requestOptions: RequestOptions?) -> String</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnString(request: "string")
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

**request:** `String` 
    
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

<details><summary><code>client.endpointsPrimitive.<a href="/Sources/Resources/EndpointsPrimitive/EndpointsPrimitiveClient.swift">endpointsPrimitiveGetAndReturnInt</a>(request: Int, requestOptions: RequestOptions?) -> Int</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnInt(request: 1)
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

**request:** `Int` 
    
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

<details><summary><code>client.endpointsPrimitive.<a href="/Sources/Resources/EndpointsPrimitive/EndpointsPrimitiveClient.swift">endpointsPrimitiveGetAndReturnLong</a>(request: Int64, requestOptions: RequestOptions?) -> Int64</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnLong(request: 1000000)
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

**request:** `Int64` 
    
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

<details><summary><code>client.endpointsPrimitive.<a href="/Sources/Resources/EndpointsPrimitive/EndpointsPrimitiveClient.swift">endpointsPrimitiveGetAndReturnDouble</a>(request: Double, requestOptions: RequestOptions?) -> Double</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnDouble(request: 1.1)
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

**request:** `Double` 
    
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

<details><summary><code>client.endpointsPrimitive.<a href="/Sources/Resources/EndpointsPrimitive/EndpointsPrimitiveClient.swift">endpointsPrimitiveGetAndReturnBool</a>(request: Bool, requestOptions: RequestOptions?) -> Bool</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnBool(request: true)
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

**request:** `Bool` 
    
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

<details><summary><code>client.endpointsPrimitive.<a href="/Sources/Resources/EndpointsPrimitive/EndpointsPrimitiveClient.swift">endpointsPrimitiveGetAndReturnDatetime</a>(request: Date, requestOptions: RequestOptions?) -> Date</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnDatetime(request: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))
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

**request:** `Date` 
    
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

<details><summary><code>client.endpointsPrimitive.<a href="/Sources/Resources/EndpointsPrimitive/EndpointsPrimitiveClient.swift">endpointsPrimitiveGetAndReturnDate</a>(request: CalendarDate, requestOptions: RequestOptions?) -> CalendarDate</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnDate(request: CalendarDate("2023-01-15")!)
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

**request:** `CalendarDate` 
    
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

<details><summary><code>client.endpointsPrimitive.<a href="/Sources/Resources/EndpointsPrimitive/EndpointsPrimitiveClient.swift">endpointsPrimitiveGetAndReturnUuid</a>(request: String, requestOptions: RequestOptions?) -> String</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnUuid(request: "string")
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

**request:** `String` 
    
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

<details><summary><code>client.endpointsPrimitive.<a href="/Sources/Resources/EndpointsPrimitive/EndpointsPrimitiveClient.swift">endpointsPrimitiveGetAndReturnBase64</a>(request: String, requestOptions: RequestOptions?) -> String</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnBase64(request: "string")
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

**request:** `String` 
    
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

## EndpointsPut
<details><summary><code>client.endpointsPut.<a href="/Sources/Resources/EndpointsPut/EndpointsPutClient.swift">endpointsPutAdd</a>(id: String, requestOptions: RequestOptions?) -> EndpointsPutResponse</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsPut.endpointsPutAdd(id: "id")
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

## EndpointsUnion
<details><summary><code>client.endpointsUnion.<a href="/Sources/Resources/EndpointsUnion/EndpointsUnionClient.swift">endpointsUnionGetAndReturnUnion</a>(request: TypesAnimal, requestOptions: RequestOptions?) -> TypesAnimal</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsUnion.endpointsUnionGetAndReturnUnion(request: TypesAnimal.typesAnimalZero(
        TypesAnimalZero(
            name: "name",
            likesToWoof: true,
            animal: .dog
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

**request:** `TypesAnimal` 
    
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

## EndpointsUrLs
<details><summary><code>client.endpointsUrLs.<a href="/Sources/Resources/EndpointsUrLs/EndpointsUrLsClient.swift">endpointsUrlsWithMixedCase</a>(requestOptions: RequestOptions?) -> String</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsUrLs.endpointsUrlsWithMixedCase()
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

<details><summary><code>client.endpointsUrLs.<a href="/Sources/Resources/EndpointsUrLs/EndpointsUrLsClient.swift">endpointsUrlsNoEndingSlash</a>(requestOptions: RequestOptions?) -> String</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsUrLs.endpointsUrlsNoEndingSlash()
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

<details><summary><code>client.endpointsUrLs.<a href="/Sources/Resources/EndpointsUrLs/EndpointsUrLsClient.swift">endpointsUrlsWithEndingSlash</a>(requestOptions: RequestOptions?) -> String</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsUrLs.endpointsUrlsWithEndingSlash()
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

<details><summary><code>client.endpointsUrLs.<a href="/Sources/Resources/EndpointsUrLs/EndpointsUrLsClient.swift">endpointsUrlsWithUnderscores</a>(requestOptions: RequestOptions?) -> String</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.endpointsUrLs.endpointsUrlsWithUnderscores()
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

## Inlinedrequests
<details><summary><code>client.inlinedrequests.<a href="/Sources/Resources/Inlinedrequests/InlinedrequestsClient.swift">postwithobjectbodyandresponse</a>(request: Requests.InlinedRequestsPostWithObjectBodyandResponseRequest, requestOptions: RequestOptions?) -> TypesObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST with custom object in request body, response is an object
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
    let client = ApiClient(token: "<token>")

    _ = try await client.inlinedrequests.postwithobjectbodyandresponse(request: .init(
        string: "string",
        integer: 1,
        nestedObject: TypesObjectWithOptionalField(

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

**request:** `Requests.InlinedRequestsPostWithObjectBodyandResponseRequest` 
    
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

## Noauth
<details><summary><code>client.noauth.<a href="/Sources/Resources/Noauth/NoauthClient.swift">postwithnoauth</a>(request: JSONValue, requestOptions: RequestOptions?) -> Bool</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

POST request with no auth
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
    let client = ApiClient(token: "<token>")

    _ = try await client.noauth.postwithnoauth(request: .object([
        "key": .string("value")
    ]))
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

**request:** `JSONValue` 
    
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

## Noreqbody
<details><summary><code>client.noreqbody.<a href="/Sources/Resources/Noreqbody/NoreqbodyClient.swift">getwithnorequestbody</a>(requestOptions: RequestOptions?) -> TypesObjectWithOptionalField</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.noreqbody.getwithnorequestbody()
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

<details><summary><code>client.noreqbody.<a href="/Sources/Resources/Noreqbody/NoreqbodyClient.swift">postwithnorequestbody</a>(requestOptions: RequestOptions?) -> String</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.noreqbody.postwithnorequestbody()
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

## Reqwithheaders
<details><summary><code>client.reqwithheaders.<a href="/Sources/Resources/Reqwithheaders/ReqwithheadersClient.swift">getwithcustomheader</a>(testEndpointHeader: String, request: String, requestOptions: RequestOptions?) -> Void</code></summary>
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
    let client = ApiClient(token: "<token>")

    _ = try await client.reqwithheaders.getwithcustomheader(request: .init(body: "string"))
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

**testEndpointHeader:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `String` 
    
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

