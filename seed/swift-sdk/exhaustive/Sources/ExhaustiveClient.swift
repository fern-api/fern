public final class ExhaustiveClient: Sendable {
    public let endpoints: EndpointsClient
    public let generalErrors: GeneralErrorsClient
    public let inlinedRequests: InlinedRequestsClient
    public let noAuth: NoAuthClient
    public let noReqBody: NoReqBodyClient
    public let reqWithHeaders: ReqWithHeadersClient
    public let types: TypesClient
    private let httpClient: HTTPClient

    public init(
        baseURL: String,
        apiKey: String,
        token: String? = nil,
        headers: [String: String]? = [:],
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: URLSession? = nil
    ) {
        let config = ClientConfig(
            baseURL: baseURL,
            apiKey: apiKey,
            token: token,
            headers: headers,
            timeout: timeout,
            urlSession: urlSession
        )
        self.endpoints = EndpointsClient(config: config)
        self.generalErrors = GeneralErrorsClient(config: config)
        self.inlinedRequests = InlinedRequestsClient(config: config)
        self.noAuth = NoAuthClient(config: config)
        self.noReqBody = NoReqBodyClient(config: config)
        self.reqWithHeaders = ReqWithHeadersClient(config: config)
        self.types = TypesClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}