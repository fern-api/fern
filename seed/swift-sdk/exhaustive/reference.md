# Reference
## Endpoints Container
<details><summary><code>client.endpoints.container.<a href="/Sources/Resources/Endpoints/Container/ContainerClient.swift">getAndReturnListOfPrimitives</a>(request: [String], requestOptions: RequestOptions?) -> [String]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.container.getAndReturnListOfPrimitives(request: [
        "string",
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

<details><summary><code>client.endpoints.container.<a href="/Sources/Resources/Endpoints/Container/ContainerClient.swift">getAndReturnListOfObjects</a>(request: [ObjectWithRequiredField], requestOptions: RequestOptions?) -> [ObjectWithRequiredField]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.container.getAndReturnListOfObjects(request: [
        ObjectWithRequiredField(
            string: "string"
        ),
        ObjectWithRequiredField(
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

**request:** `[ObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpoints.container.<a href="/Sources/Resources/Endpoints/Container/ContainerClient.swift">getAndReturnSetOfPrimitives</a>(request: JSONValue, requestOptions: RequestOptions?) -> JSONValue</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.container.getAndReturnSetOfPrimitives()
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

<details><summary><code>client.endpoints.container.<a href="/Sources/Resources/Endpoints/Container/ContainerClient.swift">getAndReturnSetOfObjects</a>(request: JSONValue, requestOptions: RequestOptions?) -> JSONValue</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.container.getAndReturnSetOfObjects()
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

<details><summary><code>client.endpoints.container.<a href="/Sources/Resources/Endpoints/Container/ContainerClient.swift">getAndReturnMapPrimToPrim</a>(request: [String: String], requestOptions: RequestOptions?) -> [String: String]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.container.getAndReturnMapPrimToPrim(request: [
        "string": "string"
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

<details><summary><code>client.endpoints.container.<a href="/Sources/Resources/Endpoints/Container/ContainerClient.swift">getAndReturnMapOfPrimToObject</a>(request: [String: ObjectWithRequiredField], requestOptions: RequestOptions?) -> [String: ObjectWithRequiredField]</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.container.getAndReturnMapOfPrimToObject(request: [
        "string": ObjectWithRequiredField(
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

**request:** `[String: ObjectWithRequiredField]` 
    
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

<details><summary><code>client.endpoints.container.<a href="/Sources/Resources/Endpoints/Container/ContainerClient.swift">getAndReturnOptional</a>(request: ObjectWithRequiredField?, requestOptions: RequestOptions?) -> ObjectWithRequiredField?</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.container.getAndReturnOptional(request: ObjectWithRequiredField(
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

**request:** `ObjectWithRequiredField?` 
    
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

## Endpoints ContentType
<details><summary><code>client.endpoints.contentType.<a href="/Sources/Resources/Endpoints/ContentType/ContentTypeClient.swift">postJsonPatchContentType</a>(request: ObjectWithOptionalField, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.contentType.postJsonPatchContentType(request: ObjectWithOptionalField(
        string: "string",
        integer: 1,
        long: 1000000,
        double: 1.1,
        bool: true,
        datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        date: CalendarDate("2023-01-15")!,
        uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        base64: "SGVsbG8gd29ybGQh",
        list: [
            "list",
            "list"
        ],
        map: [
            1: "map"
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

**request:** `ObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints.contentType.<a href="/Sources/Resources/Endpoints/ContentType/ContentTypeClient.swift">postJsonPatchContentWithCharsetType</a>(request: ObjectWithOptionalField, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.contentType.postJsonPatchContentWithCharsetType(request: ObjectWithOptionalField(
        string: "string",
        integer: 1,
        long: 1000000,
        double: 1.1,
        bool: true,
        datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        date: CalendarDate("2023-01-15")!,
        uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        base64: "SGVsbG8gd29ybGQh",
        list: [
            "list",
            "list"
        ],
        map: [
            1: "map"
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

**request:** `ObjectWithOptionalField` 
    
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

## Endpoints Enum
<details><summary><code>client.endpoints.enum.<a href="/Sources/Resources/Endpoints/Enum/EnumClient.swift">getAndReturnEnum</a>(request: WeatherReport, requestOptions: RequestOptions?) -> WeatherReport</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.enum.getAndReturnEnum(request: .sunny)
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

**request:** `WeatherReport` 
    
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

## Endpoints HttpMethods
<details><summary><code>client.endpoints.httpMethods.<a href="/Sources/Resources/Endpoints/HttpMethods/HttpMethodsClient.swift">testGet</a>(id: String, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.httpMethods.testGet(id: "id")
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

<details><summary><code>client.endpoints.httpMethods.<a href="/Sources/Resources/Endpoints/HttpMethods/HttpMethodsClient.swift">testPost</a>(request: ObjectWithRequiredField, requestOptions: RequestOptions?) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.httpMethods.testPost(request: ObjectWithRequiredField(
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

**request:** `ObjectWithRequiredField` 
    
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

<details><summary><code>client.endpoints.httpMethods.<a href="/Sources/Resources/Endpoints/HttpMethods/HttpMethodsClient.swift">testPut</a>(id: String, request: ObjectWithRequiredField, requestOptions: RequestOptions?) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.httpMethods.testPut(
        id: "id",
        request: ObjectWithRequiredField(
            string: "string"
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `ObjectWithRequiredField` 
    
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

<details><summary><code>client.endpoints.httpMethods.<a href="/Sources/Resources/Endpoints/HttpMethods/HttpMethodsClient.swift">testPatch</a>(id: String, request: ObjectWithOptionalField, requestOptions: RequestOptions?) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.httpMethods.testPatch(
        id: "id",
        request: ObjectWithOptionalField(
            string: "string",
            integer: 1,
            long: 1000000,
            double: 1.1,
            bool: true,
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            date: CalendarDate("2023-01-15")!,
            uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
            base64: "SGVsbG8gd29ybGQh",
            list: [
                "list",
                "list"
            ],
            map: [
                1: "map"
            ]
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

**id:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `ObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints.httpMethods.<a href="/Sources/Resources/Endpoints/HttpMethods/HttpMethodsClient.swift">testDelete</a>(id: String, requestOptions: RequestOptions?) -> Bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.httpMethods.testDelete(id: "id")
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

## Endpoints Object
<details><summary><code>client.endpoints.object.<a href="/Sources/Resources/Endpoints/Object/ObjectClient.swift">getAndReturnWithOptionalField</a>(request: ObjectWithOptionalField, requestOptions: RequestOptions?) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.object.getAndReturnWithOptionalField(request: ObjectWithOptionalField(
        string: "string",
        integer: 1,
        long: 1000000,
        double: 1.1,
        bool: true,
        datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        date: CalendarDate("2023-01-15")!,
        uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        base64: "SGVsbG8gd29ybGQh",
        list: [
            "list",
            "list"
        ],
        map: [
            1: "map"
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

**request:** `ObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints.object.<a href="/Sources/Resources/Endpoints/Object/ObjectClient.swift">getAndReturnWithRequiredField</a>(request: ObjectWithRequiredField, requestOptions: RequestOptions?) -> ObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.object.getAndReturnWithRequiredField(request: ObjectWithRequiredField(
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

**request:** `ObjectWithRequiredField` 
    
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

<details><summary><code>client.endpoints.object.<a href="/Sources/Resources/Endpoints/Object/ObjectClient.swift">getAndReturnWithMapOfMap</a>(request: ObjectWithMapOfMap, requestOptions: RequestOptions?) -> ObjectWithMapOfMap</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.object.getAndReturnWithMapOfMap(request: ObjectWithMapOfMap(
        map: [
            "map": [
                "map": "map"
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

**request:** `ObjectWithMapOfMap` 
    
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

<details><summary><code>client.endpoints.object.<a href="/Sources/Resources/Endpoints/Object/ObjectClient.swift">getAndReturnNestedWithOptionalField</a>(request: NestedObjectWithOptionalField, requestOptions: RequestOptions?) -> NestedObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.object.getAndReturnNestedWithOptionalField(request: NestedObjectWithOptionalField(
        string: "string",
        nestedObject: ObjectWithOptionalField(
            string: "string",
            integer: 1,
            long: 1000000,
            double: 1.1,
            bool: true,
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            date: CalendarDate("2023-01-15")!,
            uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
            base64: "SGVsbG8gd29ybGQh",
            list: [
                "list",
                "list"
            ],
            map: [
                1: "map"
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

**request:** `NestedObjectWithOptionalField` 
    
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

<details><summary><code>client.endpoints.object.<a href="/Sources/Resources/Endpoints/Object/ObjectClient.swift">getAndReturnNestedWithRequiredField</a>(string: String, request: NestedObjectWithRequiredField, requestOptions: RequestOptions?) -> NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.object.getAndReturnNestedWithRequiredField(
        string: "string",
        request: NestedObjectWithRequiredField(
            string: "string",
            nestedObject: ObjectWithOptionalField(
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                date: CalendarDate("2023-01-15")!,
                uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                base64: "SGVsbG8gd29ybGQh",
                list: [
                    "list",
                    "list"
                ],
                map: [
                    1: "map"
                ]
            )
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

**string:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `NestedObjectWithRequiredField` 
    
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

<details><summary><code>client.endpoints.object.<a href="/Sources/Resources/Endpoints/Object/ObjectClient.swift">getAndReturnNestedWithRequiredFieldAsList</a>(request: [NestedObjectWithRequiredField], requestOptions: RequestOptions?) -> NestedObjectWithRequiredField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.object.getAndReturnNestedWithRequiredFieldAsList(request: [
        NestedObjectWithRequiredField(
            string: "string",
            nestedObject: ObjectWithOptionalField(
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                date: CalendarDate("2023-01-15")!,
                uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                base64: "SGVsbG8gd29ybGQh",
                list: [
                    "list",
                    "list"
                ],
                map: [
                    1: "map"
                ]
            )
        ),
        NestedObjectWithRequiredField(
            string: "string",
            nestedObject: ObjectWithOptionalField(
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                date: CalendarDate("2023-01-15")!,
                uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                base64: "SGVsbG8gd29ybGQh",
                list: [
                    "list",
                    "list"
                ],
                map: [
                    1: "map"
                ]
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

**request:** `[NestedObjectWithRequiredField]` 
    
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

## Endpoints Params
<details><summary><code>client.endpoints.params.<a href="/Sources/Resources/Endpoints/Params/ParamsClient.swift">getWithPath</a>(param: String, requestOptions: RequestOptions?) -> String</code></summary>
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
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.params.getWithPath(param: "param")
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

<details><summary><code>client.endpoints.params.<a href="/Sources/Resources/Endpoints/Params/ParamsClient.swift">getWithInlinePath</a>(param: String, requestOptions: RequestOptions?) -> String</code></summary>
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
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.params.getWithPath(param: "param")
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

<details><summary><code>client.endpoints.params.<a href="/Sources/Resources/Endpoints/Params/ParamsClient.swift">getWithQuery</a>(query: String, number: Int, requestOptions: RequestOptions?) -> Void</code></summary>
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
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.params.getWithQuery(
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

<details><summary><code>client.endpoints.params.<a href="/Sources/Resources/Endpoints/Params/ParamsClient.swift">getWithAllowMultipleQuery</a>(query: String, number: Int, requestOptions: RequestOptions?) -> Void</code></summary>
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
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.params.getWithQuery(
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

<details><summary><code>client.endpoints.params.<a href="/Sources/Resources/Endpoints/Params/ParamsClient.swift">getWithPathAndQuery</a>(param: String, query: String, requestOptions: RequestOptions?) -> Void</code></summary>
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
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.params.getWithPathAndQuery(
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

<details><summary><code>client.endpoints.params.<a href="/Sources/Resources/Endpoints/Params/ParamsClient.swift">getWithInlinePathAndQuery</a>(param: String, query: String, requestOptions: RequestOptions?) -> Void</code></summary>
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
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.params.getWithPathAndQuery(
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

<details><summary><code>client.endpoints.params.<a href="/Sources/Resources/Endpoints/Params/ParamsClient.swift">modifyWithPath</a>(param: String, request: String, requestOptions: RequestOptions?) -> String</code></summary>
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
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.params.modifyWithPath(
        param: "param",
        request: "string"
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

<details><summary><code>client.endpoints.params.<a href="/Sources/Resources/Endpoints/Params/ParamsClient.swift">modifyWithInlinePath</a>(param: String, request: String, requestOptions: RequestOptions?) -> String</code></summary>
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
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.params.modifyWithPath(
        param: "param",
        request: "string"
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

## Endpoints Primitive
<details><summary><code>client.endpoints.primitive.<a href="/Sources/Resources/Endpoints/Primitive/PrimitiveClient.swift">getAndReturnString</a>(request: String, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.primitive.getAndReturnString(request: "string")
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

<details><summary><code>client.endpoints.primitive.<a href="/Sources/Resources/Endpoints/Primitive/PrimitiveClient.swift">getAndReturnInt</a>(request: Int, requestOptions: RequestOptions?) -> Int</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.primitive.getAndReturnInt(request: 1)
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

<details><summary><code>client.endpoints.primitive.<a href="/Sources/Resources/Endpoints/Primitive/PrimitiveClient.swift">getAndReturnLong</a>(request: Int64, requestOptions: RequestOptions?) -> Int64</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.primitive.getAndReturnLong(request: 1000000)
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

<details><summary><code>client.endpoints.primitive.<a href="/Sources/Resources/Endpoints/Primitive/PrimitiveClient.swift">getAndReturnDouble</a>(request: Double, requestOptions: RequestOptions?) -> Double</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.primitive.getAndReturnDouble(request: 1.1)
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

<details><summary><code>client.endpoints.primitive.<a href="/Sources/Resources/Endpoints/Primitive/PrimitiveClient.swift">getAndReturnBool</a>(request: Bool, requestOptions: RequestOptions?) -> Bool</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.primitive.getAndReturnBool(request: true)
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

<details><summary><code>client.endpoints.primitive.<a href="/Sources/Resources/Endpoints/Primitive/PrimitiveClient.swift">getAndReturnDatetime</a>(request: Date, requestOptions: RequestOptions?) -> Date</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.primitive.getAndReturnDatetime(request: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))
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

<details><summary><code>client.endpoints.primitive.<a href="/Sources/Resources/Endpoints/Primitive/PrimitiveClient.swift">getAndReturnDate</a>(request: CalendarDate, requestOptions: RequestOptions?) -> CalendarDate</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.primitive.getAndReturnDate(request: CalendarDate("2023-01-15")!)
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

<details><summary><code>client.endpoints.primitive.<a href="/Sources/Resources/Endpoints/Primitive/PrimitiveClient.swift">getAndReturnUuid</a>(request: UUID, requestOptions: RequestOptions?) -> UUID</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.primitive.getAndReturnUuid(request: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!)
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

**request:** `UUID` 
    
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

<details><summary><code>client.endpoints.primitive.<a href="/Sources/Resources/Endpoints/Primitive/PrimitiveClient.swift">getAndReturnBase64</a>(request: String, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.primitive.getAndReturnBase64(request: "SGVsbG8gd29ybGQh")
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

## Endpoints Put
<details><summary><code>client.endpoints.put.<a href="/Sources/Resources/Endpoints/Put/PutClient.swift">add</a>(id: String, requestOptions: RequestOptions?) -> PutResponse</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.put.add(id: "id")
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

## Endpoints Union
<details><summary><code>client.endpoints.union.<a href="/Sources/Resources/Endpoints/Union/UnionClient.swift">getAndReturnUnion</a>(request: Animal, requestOptions: RequestOptions?) -> Animal</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.union.getAndReturnUnion(request: Animal.dog(
        .init(
            name: "name",
            likesToWoof: true
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

**request:** `Animal` 
    
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

## Endpoints Urls
<details><summary><code>client.endpoints.urls.<a href="/Sources/Resources/Endpoints/Urls/UrlsClient.swift">withMixedCase</a>(requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.urls.withMixedCase()
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

<details><summary><code>client.endpoints.urls.<a href="/Sources/Resources/Endpoints/Urls/UrlsClient.swift">noEndingSlash</a>(requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.urls.noEndingSlash()
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

<details><summary><code>client.endpoints.urls.<a href="/Sources/Resources/Endpoints/Urls/UrlsClient.swift">withEndingSlash</a>(requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.urls.withEndingSlash()
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

<details><summary><code>client.endpoints.urls.<a href="/Sources/Resources/Endpoints/Urls/UrlsClient.swift">withUnderscores</a>(requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.endpoints.urls.withUnderscores()
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

## InlinedRequests
<details><summary><code>client.inlinedRequests.<a href="/Sources/Resources/InlinedRequests/InlinedRequestsClient.swift">postWithObjectBodyandResponse</a>(request: Requests.PostWithObjectBody, requestOptions: RequestOptions?) -> ObjectWithOptionalField</code></summary>
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
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.inlinedRequests.postWithObjectBodyandResponse(request: .init(
        string: "string",
        integer: 1,
        nestedObject: ObjectWithOptionalField(
            string: "string",
            integer: 1,
            long: 1000000,
            double: 1.1,
            bool: true,
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            date: CalendarDate("2023-01-15")!,
            uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
            base64: "SGVsbG8gd29ybGQh",
            list: [
                "list",
                "list"
            ],
            map: [
                1: "map"
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

**request:** `Requests.PostWithObjectBody` 
    
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

## NoAuth
<details><summary><code>client.noAuth.<a href="/Sources/Resources/NoAuth/NoAuthClient.swift">postWithNoAuth</a>(request: JSONValue, requestOptions: RequestOptions?) -> Bool</code></summary>
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
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.noAuth.postWithNoAuth(request: .object([
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

## NoReqBody
<details><summary><code>client.noReqBody.<a href="/Sources/Resources/NoReqBody/NoReqBodyClient.swift">getWithNoRequestBody</a>(requestOptions: RequestOptions?) -> ObjectWithOptionalField</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.noReqBody.getWithNoRequestBody()
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

<details><summary><code>client.noReqBody.<a href="/Sources/Resources/NoReqBody/NoReqBodyClient.swift">postWithNoRequestBody</a>(requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.noReqBody.postWithNoRequestBody()
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

## ReqWithHeaders
<details><summary><code>client.reqWithHeaders.<a href="/Sources/Resources/ReqWithHeaders/ReqWithHeadersClient.swift">getWithCustomHeader</a>(xTestEndpointHeader: String, request: String, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    _ = try await client.reqWithHeaders.getWithCustomHeader(request: .init(body: "string"))
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

**xTestEndpointHeader:** `String` 
    
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

