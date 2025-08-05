public final class BasicAuthClient_: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithBasicAuth(requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .get,
            path: "/basic-auth",
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }

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