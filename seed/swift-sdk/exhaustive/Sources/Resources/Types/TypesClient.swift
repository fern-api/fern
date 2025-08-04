public final class TypesClient: Sendable {
    public let docs: DocsClient
    public let `enum`: EnumClient
    public let object: ObjectClient
    public let union: UnionClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.docs = DocsClient(config: config)
        self.enum = EnumClient(config: config)
        self.object = ObjectClient(config: config)
        self.union = UnionClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}