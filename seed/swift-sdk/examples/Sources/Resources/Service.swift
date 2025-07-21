public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func check(id: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/check/\(id)", 
            requestOptions: requestOptions
        )
    }

    public func ping(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/ping", 
            requestOptions: requestOptions
        )
    }
}stOptions
        )
    }

    public func getMetadata(requestOptions: RequestOptions? = nil) async throws -> Metadata {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/metadata", 
            requestOptions: requestOptions
        )
    }

    public func createBigEntity(requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/big-entity", 
            requestOptions: requestOptions
        )
    }
}