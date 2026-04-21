import Foundation

public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func gettoken(request: Requests.AuthGetTokenRequest, requestOptions: RequestOptions? = nil) async throws -> AuthGetTokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/oauth/token",
            body: request,
            requestOptions: requestOptions,
            responseType: AuthGetTokenResponse.self
        )
    }
}