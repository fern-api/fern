import Foundation

public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getTokenWithClientCredentials(xApiKey: String, request: GetTokenRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token",
            headers: [
                "X-Api-Key": xApiKey
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }

    public func refreshToken(xApiKey: String, request: RefreshTokenRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token/refresh",
            headers: [
                "X-Api-Key": xApiKey
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }
}