public final class BasicAuthClient_: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// GET request with basic auth scheme
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithBasicAuth(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .get,
            path: "/basic-auth",
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }

    /// POST request with basic auth scheme
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postWithBasicAuth(request: JSONValue, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post,
            path: "/basic-auth",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}