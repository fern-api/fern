public final class UnknownClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func post(requestOptions: RequestOptions? = nil) async throws -> [Any] {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/", 
            requestOptions: requestOptions
        )
    }

    public func postObject(requestOptions: RequestOptions? = nil) async throws -> [Any] {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/with-object", 
            requestOptions: requestOptions
        )
    }
}