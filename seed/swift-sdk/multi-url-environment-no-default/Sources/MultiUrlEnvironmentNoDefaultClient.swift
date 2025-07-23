public final class MultiUrlEnvironmentNoDefaultClient: Sendable {
    public let ec2: Ec2Client
    public let s3: S3Client
    private let config: ClientConfig

    public init(
        baseURL: String,
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
        self.ec2 = Ec2Client(config: config)
        self.s3 = S3Client(config: config)
    }
}