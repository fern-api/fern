public final class ObjectsWithImportsClient: Sendable {
    public let commons: CommonsClient
    public let file: FileClient
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
        self.commons = CommonsClient(config: config)
        self.file = FileClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}