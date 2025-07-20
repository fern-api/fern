public final class IdempotencyHeadersClient: Sendable {
    public let payment: PaymentClient
    private let config: ClientConfig

    public init(baseURL: String = IdempotencyHeadersEnvironment.default.rawValue, apiKey qpiKey: String, token: String? = nil, headers: [String: String]? = [:], timeout: Int? = nil, maxRetries: Int? = nil, urlSession: URLSession? = nil) {
        self.config = ClientConfig(baseURL: baseURL, apiKey: apiKey, token: token, headers: headers, timeout: timeout, urlSession: urlSession)
        self.payment = PaymentClient(config: config)
    }
}