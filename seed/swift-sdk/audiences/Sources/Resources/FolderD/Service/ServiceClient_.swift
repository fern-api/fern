public final class ServiceClient_: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getDirectThread(requestOptions: RequestOptions? = nil) async throws -> Response {
        return try await httpClient.performRequest(
            method: .get,
            path: "/partner-path",
            requestOptions: requestOptions,
            responseType: Response.self
        )
    }
}