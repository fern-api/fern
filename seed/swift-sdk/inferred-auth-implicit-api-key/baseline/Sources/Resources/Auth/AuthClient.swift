import Foundation

public final class AuthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getToken(apiKey: String, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/token",
            headers: [
                "X-Api-Key": apiKey
            ],
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }
}