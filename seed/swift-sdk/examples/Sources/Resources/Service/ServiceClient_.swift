public final class ServiceClient_: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getMovie(movieId: String, requestOptions: RequestOptions? = nil) async throws -> Movie {
        return try await httpClient.performRequest(
            method: .get,
            path: "/movie/\(movieId)",
            requestOptions: requestOptions,
            responseType: Movie.self
        )
    }

    public func createMovie(request: Movie, requestOptions: RequestOptions? = nil) async throws -> MovieId {
        return try await httpClient.performRequest(
            method: .post,
            path: "/movie",
            body: request,
            requestOptions: requestOptions,
            responseType: MovieId.self
        )
    }

    public func getMetadata(xApiVersion: String, shallow: Bool? = nil, tag: String? = nil, requestOptions: RequestOptions? = nil) async throws -> MetadataType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/metadata",
            headers: [
                "X-API-Version": xApiVersion
            ],
            queryParams: [
                "shallow": shallow.map { .bool($0) }, 
                "tag": tag.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: MetadataType.self
        )
    }

    public func createBigEntity(request: BigEntity, requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post,
            path: "/big-entity",
            body: request,
            requestOptions: requestOptions,
            responseType: Response.self
        )
    }
}