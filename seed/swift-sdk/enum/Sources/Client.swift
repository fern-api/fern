public final class EnumClient: Sendable {
    public let inlinedRequest: InlinedRequestClient
    public let pathParam: PathParamClient
    public let queryParam: QueryParamClient
    public let unknown: UnknownClient
    private let config: ClientConfig
}