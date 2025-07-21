public final class UnionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(requestOptions: RequestOptions? = nil) async throws -> MyUnion {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/", 
            requestOptions: requestOptions
        )
    }

    public func getMetadata(requestOptions: RequestOptions? = nil) async throws -> Metadata {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/metadata", 
            requestOptions: requestOptions
        )
    }

    public func updateMetadata(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .put, 
            path: "/metadata", 
            requestOptions: requestOptions
        )
    }

    public func call(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/call", 
            requestOptions: requestOptions
        )
    }

    public func duplicateTypesUnion(requestOptions: RequestOptions? = nil) async throws -> UnionWithDuplicateTypes {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/duplicate", 
            requestOptions: requestOptions
        )
    }

    public func nestedUnions(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/nested", 
            requestOptions: requestOptions
        )
    }
}