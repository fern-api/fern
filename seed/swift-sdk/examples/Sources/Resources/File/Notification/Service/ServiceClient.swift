public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getException(notificationId: String, requestOptions: RequestOptions? = nil) async throws -> Exception {
        return try await httpClient.performRequest(
            method: .get,
            path: "/file/notification/\(notificationId)",
            requestOptions: requestOptions,
            responseType: Exception.self
        )
    }
}