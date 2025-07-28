public final class SingleUrlEnvironmentNoDefaultClient: Sendable {
    public let dummy: DummyClient
    private let httpClient: HTTPClient

    public init(
        baseURL: String = SingleUrlEnvironmentNoDefaultEnvironment.production.rawValue,
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
        self.httpClient = HTTPClient(config: config)
        self.dummy = DummyClient(config: config)
    }
}