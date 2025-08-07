/// Use this class to access the different functions within the SDK. You can instantiate any number of clients with different configuration that will propagate to these functions.
public final class ExhaustiveClient: Sendable {
    public let endpoints: EndpointsClient
    public let generalErrors: GeneralErrorsClient
    public let inlinedRequests: InlinedRequestsClient
    public let noAuth: NoAuthClient
    public let noReqBody: NoReqBodyClient
    public let reqWithHeaders: ReqWithHeadersClient
    public let types: TypesClient
    private let httpClient: HTTPClient

    /// Initialize the client with the specified configuration.
    ///
    /// - Parameter baseURL: The base URL to use for requests from the client. If not provided, the default base URL will be used.
    /// - Parameter token: Bearer token for authentication. If provided, will be sent as "Bearer {token}" in Authorization header.
    /// - Parameter headers: Additional headers to send with each request.
    /// - Parameter timeout: Request timeout in seconds. Defaults to 60 seconds. Ignored if a custom `urlSession` is provided.
    /// - Parameter maxRetries: Maximum number of retries for failed requests. Defaults to 2.
    /// - Parameter urlSession: Custom `URLSession` to use for requests. If not provided, a default session will be created with the specified timeout.
    public init(
        baseURL: String,
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
            maxRetries: maxRetries,
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