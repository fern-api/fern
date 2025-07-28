public final class TypesClient: Sendable {
    public let docs: DocsClient
    public let `enum`: EnumClient
    public let object: ObjectClient
    public let union: UnionClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }
}