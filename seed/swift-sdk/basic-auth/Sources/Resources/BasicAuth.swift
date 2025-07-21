public final class BasicAuthClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithBasicAuth(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/basic-auth", 
            requestOptions: requestOptions
        )
    }

    public func postWithBasicAuth(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/basic-auth", 
            requestOptions: requestOptions
        )
    }
}