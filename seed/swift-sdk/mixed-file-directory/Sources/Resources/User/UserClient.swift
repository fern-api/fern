public final class UserClient: Sendable {
    public let events: EventsClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.events = EventsClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }

    public func list(limit: Int? = nil, requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "limit": limit.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }
}