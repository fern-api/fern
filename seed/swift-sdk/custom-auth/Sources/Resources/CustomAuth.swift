public final class CustomAuthClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithCustomAuth(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/custom-auth", 
            requestOptions: requestOptions
        )
    }

    public func postWithCustomAuth(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/custom-auth", 
            requestOptions: requestOptions
        )
    }
}