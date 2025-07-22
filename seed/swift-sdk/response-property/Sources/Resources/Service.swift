public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getMovie(request: String, requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: Response.self
        )
    }

    public func getMovieDocs(request: String, requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: Response.self
        )
    }

    public func getMovieName(request: String, requestOptions: RequestOptions? = nil) async throws -> StringResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: StringResponse.self
        )
    }

    public func getMovieMetadata(request: String, requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: Response.self
        )
    }

    public func getOptionalMovie(request: String, requestOptions: RequestOptions? = nil) async throws -> Response? {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: Response?.self
        )
    }

    public func getOptionalMovieDocs(request: String, requestOptions: RequestOptions? = nil) async throws -> OptionalWithDocs {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: OptionalWithDocs.self
        )
    }

    public func getOptionalMovieName(request: String, requestOptions: RequestOptions? = nil) async throws -> OptionalStringResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/movie", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: OptionalStringResponse.self
        )
    }
}