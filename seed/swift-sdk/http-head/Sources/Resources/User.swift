public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func head(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .head,
            path: "/users",
            requestOptions: requestOptions,
            responseType: Any.self
        )
    }

    public func list(limit: Int, requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "limit": .int(limit)
            ],
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }
}