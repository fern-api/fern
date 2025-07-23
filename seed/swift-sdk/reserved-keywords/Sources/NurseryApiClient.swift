public final class NurseryApiClient: Sendable {
    public let package: PackageClient
    private let config: ClientConfig

    public init(
        baseURL: String = NurseryApiEnvironment.default.rawValue,
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
        self.package = PackageClient(config: config)
    }
}