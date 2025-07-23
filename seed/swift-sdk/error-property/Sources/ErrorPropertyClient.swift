public final class ErrorPropertyClient: Sendable {
    public let errors: ErrorsClient
    public let propertyBasedError: PropertyBasedErrorClient
    private let config: ClientConfig

    public init(
        baseURL: String = ErrorPropertyEnvironment.default.rawValue,
        apiKey qpiKey: String,
        token: String? = nil,
        headers: [String: String]? = [:],
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: URLSession? = nil
    ) {
        self.config = ClientConfig(
            baseURL: baseURL,
            apiKey: apiKey,
            token: token,
            headers: headers,
            timeout: timeout,
            urlSession: urlSession
        )
        self.errors = ErrorsClient(config: config)
        self.propertyBasedError = PropertyBasedErrorClient(config: config)
    }
}