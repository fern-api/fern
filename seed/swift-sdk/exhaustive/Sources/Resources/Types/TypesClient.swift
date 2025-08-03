public final class TypesClient: Sendable {
    public let docs: DocsClient
    public let `enum`: EnumClient_
    public let object: ObjectClient_
    public let union: UnionClient_
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.docs = DocsClient(config: config)
        self.enum = EnumClient_(config: config)
        self.object = ObjectClient_(config: config)
        self.union = UnionClient_(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}