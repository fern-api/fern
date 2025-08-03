public final class HealthClient: Sendable {
    public let service: ServiceClient__
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.service = ServiceClient__(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}