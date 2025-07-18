public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getTokenWithClientCredentials(requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        fatalError("Not implemented.")
    }

    public func refreshToken(requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        fatalError("Not implemented.")
    }
}