public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getTokenWithClientCredentials(request: Any, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/token", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: TokenResponse.self
        )
    }

    public func refreshToken(request: Any, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/token", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: TokenResponse.self
        )
    }
}