# Reference
<details><summary><code>client.<a href="/Sources/ExamplesClient.swift">echo</a>(request: String, requestOptions: RequestOptions?) -> String</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    _ = try await client.echo(request: "Hello world!\n\nwith\n\tnewlines")
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

<details><summary><code>client.<a href="/Sources/ExamplesClient.swift">createType</a>(request: Type, requestOptions: RequestOptions?) -> Identifier</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    _ = try await client.echo(request: "primitive")
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

**request:** `Type` 
    
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

## File Notification Service
<details><summary><code>client.file.notification.service.<a href="/Sources/Resources/File/Notification/Service/ServiceClient.swift">getException</a>(notificationId: String, requestOptions: RequestOptions?) -> Exception</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    _ = try await client.file.notification.service.getException(notificationId: "notification-hsy129x")
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

**notificationId:** `String` 
    
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

## File Service
<details><summary><code>client.file.service.<a href="/Sources/Resources/File/Service/FileServiceClient.swift">getFile</a>(filename: String, requestOptions: RequestOptions?) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint returns a file by its name.
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
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    _ = try await client.file.service.getFile(filename: "file.txt")
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

**filename:** `String` — This is a filename
    
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

## Health Service
<details><summary><code>client.health.service.<a href="/Sources/Resources/Health/Service/HealthServiceClient.swift">check</a>(id: String, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of a resource.
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
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    _ = try await client.health.service.check(id: "id-2sdx82h")
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

**id:** `String` — The id to check
    
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

<details><summary><code>client.health.service.<a href="/Sources/Resources/Health/Service/HealthServiceClient.swift">ping</a>(requestOptions: RequestOptions?) -> Bool</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint checks the health of the service.
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
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    _ = try await client.health.service.ping()
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

## Service
<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient_.swift">getMovie</a>(movieId: String, requestOptions: RequestOptions?) -> Movie</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    _ = try await client.service.getMovie(movieId: "movie-c06a4ad7")
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

**movieId:** `String` 
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient_.swift">createMovie</a>(request: Movie, requestOptions: RequestOptions?) -> MovieId</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    _ = try await client.service.createMovie(request: Movie(
        id: "movie-c06a4ad7",
        prequel: "movie-cv9b914f",
        title: "The Boy and the Heron",
        from: "Hayao Miyazaki",
        rating: 8,
        type: .movie,
        tag: "tag-wf9as23d",
        metadata: [
            "actors": .array([
                .string("Christian Bale"),
                .string("Florence Pugh"),
                .string("Willem Dafoe")
            ]), 
            "releaseDate": .string("2023-12-08"), 
            "ratings": .object([
                "rottenTomatoes": .number(97), 
                "imdb": .number(7.6)
            ])
        ],
        revenue: 1000000
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

**request:** `Movie` 
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient_.swift">getMetadata</a>(xApiVersion: String, shallow: Bool?, tag: String?, requestOptions: RequestOptions?) -> MetadataType</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    _ = try await client.service.getMetadata(
        shallow: false,
        tag: 
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

**xApiVersion:** `String` 
    
</dd>
</dl>

<dl>
<dd>

**shallow:** `Bool?` 
    
</dd>
</dl>

<dl>
<dd>

**tag:** `String?` 
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient_.swift">createBigEntity</a>(request: BigEntity, requestOptions: RequestOptions?) -> Response</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    _ = try await client.service.createBigEntity(request: BigEntity(
        castMember: CastMember.actor(
            Actor(
                name: "name",
                id: "id"
            )
        ),
        extendedMovie: ExtendedMovie(
            id: "id",
            prequel: "prequel",
            title: "title",
            from: "from",
            rating: 1.1,
            type: .movie,
            tag: "tag",
            book: "book",
            metadata: [
                "metadata": .object([
                    "key": .string("value")
                ])
            ],
            revenue: 1000000,
            cast: [
                "cast",
                "cast"
            ]
        ),
        entity: Entity(
            type: `Type`.basicType(
                .primitive
            ),
            name: "name"
        ),
        metadata: Metadata.html(
            .init(
                extra: [
                    "extra": "extra"
                ],
                tags: ,
                html: 
            )
        ),
        commonMetadata: Metadata(
            id: "id",
            data: [
                "data": "data"
            ],
            jsonString: "jsonString"
        ),
        eventInfo: EventInfo.metadata(
            .init(
                id: "id",
                data: [
                    "data": "data"
                ],
                jsonString: "jsonString"
            )
        ),
        data: Data.string(
            .init(
                string: 
            )
        ),
        migration: Migration(
            name: "name",
            status: .running
        ),
        exception: Exception.generic(
            .init(
                exceptionType: "exceptionType",
                exceptionMessage: "exceptionMessage",
                exceptionStacktrace: "exceptionStacktrace"
            )
        ),
        test: Test.and(
            .init(
                and: 
            )
        ),
        node: Node(
            name: "name",
            nodes: [
                Node(
                    name: "name",
                    nodes: [
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        ),
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        )
                    ],
                    trees: [
                        Tree(
                            nodes: []
                        ),
                        Tree(
                            nodes: []
                        )
                    ]
                ),
                Node(
                    name: "name",
                    nodes: [
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        ),
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        )
                    ],
                    trees: [
                        Tree(
                            nodes: []
                        ),
                        Tree(
                            nodes: []
                        )
                    ]
                )
            ],
            trees: [
                Tree(
                    nodes: [
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        ),
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        )
                    ]
                ),
                Tree(
                    nodes: [
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        ),
                        Node(
                            name: "name",
                            nodes: [],
                            trees: []
                        )
                    ]
                )
            ]
        ),
        directory: Directory(
            name: "name",
            files: [
                File(
                    name: "name",
                    contents: "contents"
                ),
                File(
                    name: "name",
                    contents: "contents"
                )
            ],
            directories: [
                Directory(
                    name: "name",
                    files: [
                        File(
                            name: "name",
                            contents: "contents"
                        ),
                        File(
                            name: "name",
                            contents: "contents"
                        )
                    ],
                    directories: [
                        Directory(
                            name: "name",
                            files: [],
                            directories: []
                        ),
                        Directory(
                            name: "name",
                            files: [],
                            directories: []
                        )
                    ]
                ),
                Directory(
                    name: "name",
                    files: [
                        File(
                            name: "name",
                            contents: "contents"
                        ),
                        File(
                            name: "name",
                            contents: "contents"
                        )
                    ],
                    directories: [
                        Directory(
                            name: "name",
                            files: [],
                            directories: []
                        ),
                        Directory(
                            name: "name",
                            files: [],
                            directories: []
                        )
                    ]
                )
            ]
        ),
        moment: Moment(
            id: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
            date: CalendarDate("2023-01-15")!,
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
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

**request:** `BigEntity` 
    
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

<details><summary><code>client.service.<a href="/Sources/Resources/Service/ServiceClient_.swift">refreshToken</a>(request: RefreshTokenRequest?, requestOptions: RequestOptions?) -> Void</code></summary>
<dl>
<dd>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```swift
import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(token: "<token>")

    _ = try await client.service.refreshToken(request: RefreshTokenRequest(

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

**request:** `RefreshTokenRequest?` 
    
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
