public final class UnionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(id: String, requestOptions: RequestOptions? = nil) async throws -> Shape {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/\(id)", 
            requestOptions: requestOptions
        )
    }

    public func update(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .patch, 
            path: "/", 
            requestOptions: requestOptions
        )
    }
}