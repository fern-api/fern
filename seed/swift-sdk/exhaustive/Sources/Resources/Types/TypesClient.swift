import Foundation

public final class TypesClient: Sendable {
    public let docs: DocsClient
    public let `enum`: TypesEnumClient
    public let object: TypesObjectClient
    public let union: TypesUnionClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.docs = DocsClient(config: config)
        self.enum = TypesEnumClient(config: config)
        self.object = TypesObjectClient(config: config)
        self.union = TypesUnionClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}