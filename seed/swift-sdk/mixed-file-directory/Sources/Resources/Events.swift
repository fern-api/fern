public final class EventsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listEvents(limit: Int? = nil, requestOptions: RequestOptions? = nil) async throws -> [Event] {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users/events", 
            queryParams: [
                "limit": limit.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }
}