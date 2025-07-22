public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func nop(id: String, nestedId: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(id)//\(nestedId)",
            requestOptions: requestOptions,
            responseType: Any.self
        )
    }
}