public final class EventsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listEvents(requestOptions: RequestOptions? = nil) async throws -> [Event] {
        fatalError("Not implemented.")
    }
}