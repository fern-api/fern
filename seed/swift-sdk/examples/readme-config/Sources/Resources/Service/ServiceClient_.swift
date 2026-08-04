import Foundation

public final class ServiceClient_: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Examples
    ///
    /// private func main() async throws {
    ///     let client = ExamplesClient(token: "<token>")
    ///
    ///     _ = try await client.service.getMovie(movieId: "movie-c06a4ad7")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getMovie(movieId: String, requestOptions: RequestOptions? = nil) async throws -> Movie {
        return try await httpClient.performRequest(
            method: .get,
            path: "/movie/\(movieId)",
            requestOptions: requestOptions,
            responseType: Movie.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Examples
    ///
    /// private func main() async throws {
    ///     let client = ExamplesClient(token: "<token>")
    ///
    ///     _ = try await client.service.createMovie(request: Movie(
    ///         id: "movie-c06a4ad7",
    ///         prequel: "movie-cv9b914f",
    ///         title: "The Boy and the Heron",
    ///         from: "Hayao Miyazaki",
    ///         rating: 8,
    ///         type: .movie,
    ///         tag: "tag-wf9as23d",
    ///         metadata: [
    ///             "actors": .array([
    ///                 .string("Christian Bale"),
    ///                 .string("Florence Pugh"),
    ///                 .string("Willem Dafoe")
    ///             ]), 
    ///             "releaseDate": .string("2023-12-08"), 
    ///             "ratings": .object([
    ///                 "rottenTomatoes": .number(97), 
    ///                 "imdb": .number(7.6)
    ///             ])
    ///         ],
    ///         revenue: 1000000
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createMovie(request: Movie, requestOptions: RequestOptions? = nil) async throws -> MovieId {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie",
            body: request,
            requestOptions: requestOptions,
            responseType: MovieId.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Examples
    ///
    /// private func main() async throws {
    ///     let client = ExamplesClient(token: "<token>")
    ///
    ///     _ = try await client.service.getMetadata(
    ///         xApiVersion: "0.0.1",
    ///         shallow: false,
    ///         tag: [
    ///             "development"
    ///         ]
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getMetadata(xApiVersion: String, shallow: Bool? = nil, tag: [String]? = nil, requestOptions: RequestOptions? = nil) async throws -> MetadataType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/metadata",
            headers: [
                "X-API-Version": xApiVersion
            ],
            queryParams: [
                "shallow": shallow.map { .bool($0) }, 
                "tag": tag.map { .stringArray($0) }
            ],
            requestOptions: requestOptions,
            responseType: MetadataType.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Examples
    ///
    /// private func main() async throws {
    ///     let client = ExamplesClient(token: "<token>")
    ///
    ///     _ = try await client.service.createBigEntity(request: BigEntity(
    ///         castMember: CastMember.actor(
    ///             Actor(
    ///                 name: "name",
    ///                 id: "id"
    ///             )
    ///         ),
    ///         extendedMovie: ExtendedMovie(
    ///             id: "id",
    ///             prequel: "prequel",
    ///             title: "title",
    ///             from: "from",
    ///             rating: 1.1,
    ///             type: .movie,
    ///             tag: "tag",
    ///             book: "book",
    ///             metadata: [
    ///                 "metadata": .object([
    ///                     "key": .string("value")
    ///                 ])
    ///             ],
    ///             revenue: 1000000,
    ///             cast: [
    ///                 "cast",
    ///                 "cast"
    ///             ]
    ///         ),
    ///         entity: Entity(
    ///             type: `Type`.basicType(
    ///                 .primitive
    ///             ),
    ///             name: "name"
    ///         ),
    ///         metadata: MetadataType.html(
    ///             "metadata"
    ///         ),
    ///         commonMetadata: Metadata(
    ///             id: "id",
    ///             data: [
    ///                 "data": "data"
    ///             ],
    ///             jsonString: "jsonString"
    ///         ),
    ///         eventInfo: EventInfo.metadata(
    ///             Metadata(
    ///                 id: "id",
    ///                 data: [
    ///                     "data": "data"
    ///                 ],
    ///                 jsonString: "jsonString"
    ///             )
    ///         ),
    ///         data: Data.string(
    ///             "data"
    ///         ),
    ///         migration: Migration(
    ///             name: "name",
    ///             status: .running
    ///         ),
    ///         exception: Exception.generic(
    ///             ExceptionInfo(
    ///                 exceptionType: "exceptionType",
    ///                 exceptionMessage: "exceptionMessage",
    ///                 exceptionStacktrace: "exceptionStacktrace"
    ///             )
    ///         ),
    ///         test: Test.and(
    ///             true
    ///         ),
    ///         node: Node(
    ///             name: "name",
    ///             nodes: [
    ///                 Node(
    ///                     name: "name",
    ///                     nodes: [
    ///                         Node(
    ///                             name: "name"
    ///                         ),
    ///                         Node(
    ///                             name: "name"
    ///                         )
    ///                     ],
    ///                     trees: [
    ///                         Tree(
    ///                             nodes: []
    ///                         ),
    ///                         Tree(
    ///                             nodes: []
    ///                         )
    ///                     ]
    ///                 ),
    ///                 Node(
    ///                     name: "name",
    ///                     nodes: [
    ///                         Node(
    ///                             name: "name"
    ///                         ),
    ///                         Node(
    ///                             name: "name"
    ///                         )
    ///                     ],
    ///                     trees: [
    ///                         Tree(
    ///                             nodes: []
    ///                         ),
    ///                         Tree(
    ///                             nodes: []
    ///                         )
    ///                     ]
    ///                 )
    ///             ],
    ///             trees: [
    ///                 Tree(
    ///                     nodes: [
    ///                         Node(
    ///                             name: "name",
    ///                             nodes: [],
    ///                             trees: []
    ///                         ),
    ///                         Node(
    ///                             name: "name",
    ///                             nodes: [],
    ///                             trees: []
    ///                         )
    ///                     ]
    ///                 ),
    ///                 Tree(
    ///                     nodes: [
    ///                         Node(
    ///                             name: "name",
    ///                             nodes: [],
    ///                             trees: []
    ///                         ),
    ///                         Node(
    ///                             name: "name",
    ///                             nodes: [],
    ///                             trees: []
    ///                         )
    ///                     ]
    ///                 )
    ///             ]
    ///         ),
    ///         directory: Directory(
    ///             name: "name",
    ///             files: [
    ///                 File(
    ///                     name: "name",
    ///                     contents: "contents"
    ///                 ),
    ///                 File(
    ///                     name: "name",
    ///                     contents: "contents"
    ///                 )
    ///             ],
    ///             directories: [
    ///                 Directory(
    ///                     name: "name",
    ///                     files: [
    ///                         File(
    ///                             name: "name",
    ///                             contents: "contents"
    ///                         ),
    ///                         File(
    ///                             name: "name",
    ///                             contents: "contents"
    ///                         )
    ///                     ],
    ///                     directories: [
    ///                         Directory(
    ///                             name: "name"
    ///                         ),
    ///                         Directory(
    ///                             name: "name"
    ///                         )
    ///                     ]
    ///                 ),
    ///                 Directory(
    ///                     name: "name",
    ///                     files: [
    ///                         File(
    ///                             name: "name",
    ///                             contents: "contents"
    ///                         ),
    ///                         File(
    ///                             name: "name",
    ///                             contents: "contents"
    ///                         )
    ///                     ],
    ///                     directories: [
    ///                         Directory(
    ///                             name: "name"
    ///                         ),
    ///                         Directory(
    ///                             name: "name"
    ///                         )
    ///                     ]
    ///                 )
    ///             ]
    ///         ),
    ///         moment: Moment(
    ///             id: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///             date: CalendarDate("2023-01-15")!,
    ///             datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
    ///         )
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createBigEntity(request: BigEntity, requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post,
            path: "/big-entity",
            body: request,
            requestOptions: requestOptions,
            responseType: Response.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Examples
    ///
    /// private func main() async throws {
    ///     let client = ExamplesClient(token: "<token>")
    ///
    ///     _ = try await client.service.refreshToken()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func refreshToken(request: RefreshTokenRequest? = nil, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/refresh-token",
            body: request,
            requestOptions: requestOptions
        )
    }
}