import Foundation

public final class EndpointsClient: Sendable {
    public let container: ContainerClient
    public let contentType: ContentTypeClient
    public let `enum`: EnumClient
    public let httpMethods: HttpMethodsClient
    public let object: ObjectClient
    public let params: ParamsClient
    public let primitive: PrimitiveClient
    public let put: PutClient
    public let union: UnionClient
    public let urls: UrlsClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.container = ContainerClient(config: config)
        self.contentType = ContentTypeClient(config: config)
        self.enum = EnumClient(config: config)
        self.httpMethods = HttpMethodsClient(config: config)
        self.object = ObjectClient(config: config)
        self.params = ParamsClient(config: config)
        self.primitive = PrimitiveClient(config: config)
        self.put = PutClient(config: config)
        self.union = UnionClient(config: config)
        self.urls = UrlsClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}