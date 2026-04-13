import Foundation

public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func gettokenwithclientcredentials(request: Requests.AuthGetTokenWithClientCredentialsRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token",
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }

    public func refreshtoken(request: Requests.AuthRefreshTokenRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token/refresh",
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }
}