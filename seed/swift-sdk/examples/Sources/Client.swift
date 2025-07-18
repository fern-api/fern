public final class ExamplesClient: Sendable {
    public let commons: CommonsClient
    public let file: FileClient
    public let health: HealthClient
    public let service: ServiceClient
    public let types: TypesClient
    private let config: ClientConfig
}