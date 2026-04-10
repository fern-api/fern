import Foundation

public final class NoauthClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// POST request with no auth
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postwithnoauth(request: JSONValue, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post,
            path: "/no-auth",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}