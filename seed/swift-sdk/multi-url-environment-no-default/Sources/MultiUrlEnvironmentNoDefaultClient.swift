public final class MultiUrlEnvironmentNoDefaultClient: Sendable {
    public let ec2: Ec2Client
    public let s3: S3Client
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
        self.ec2 = Ec2Client(config: config)
        self.s3 = S3Client(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}