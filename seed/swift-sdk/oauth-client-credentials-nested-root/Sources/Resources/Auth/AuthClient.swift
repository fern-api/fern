import Foundation

public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func gettoken(request: Requests.AuthGetTokenRequest, requestOptions: RequestOptions? = nil) async throws -> AuthTokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token",
            body: request,
            requestOptions: requestOptions,
            responseType: AuthTokenResponse.self
        )
    }
}