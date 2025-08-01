public final class ErrorPropertyClient: Sendable {
    public let errors: ErrorsClient
    public let propertyBasedError: PropertyBasedErrorClient
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
        self.errors = ErrorsClient(config: config)
        self.propertyBasedError = PropertyBasedErrorClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}