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
        self.httpClient = HTTPClient(config: config)
    }
}