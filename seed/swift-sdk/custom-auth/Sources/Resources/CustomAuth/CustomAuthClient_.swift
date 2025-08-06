public final class CustomAuthClient_: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// GET request with custom auth scheme
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithCustomAuth(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .get,
            path: "/custom-auth",
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }

    /// POST request with custom auth scheme
    ///
    /// - Parameter request: 
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postWithCustomAuth(request: JSONValue, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post,
            path: "/custom-auth",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}