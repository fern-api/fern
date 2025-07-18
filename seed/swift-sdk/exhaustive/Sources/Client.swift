public final class ExhaustiveClient: Sendable {
    public let endpoints: EndpointsClient
    public let generalErrors: GeneralErrorsClient
    public let inlinedRequests: InlinedRequestsClient
    public let noAuth: NoAuthClient
    public let noReqBody: NoReqBodyClient
    public let reqWithHeaders: ReqWithHeadersClient
    public let types: TypesClient
    private let config: ClientConfig
}