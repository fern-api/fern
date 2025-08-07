/// Use this class to access the different functions within the SDK. You can instantiate any number of clients with different configuration that will propagate to these functions.
///
/// - Parameter baseURL: The base URL to use for requests from the client. If not provided, the default base URL will be used.
/// - Parameter apiKey: The API key for authentication.
/// - Parameter token: Bearer token for authentication. If provided, will be sent as "Bearer {token}" in Authorization header.
/// - Parameter headers: Additional headers to send with each request.
/// - Parameter timeout: Request timeout in seconds. Defaults to 60 seconds. Ignored if a custom `urlSession` is provided.
/// - Parameter maxRetries: Maximum number of retries for failed requests. Defaults to 2.
/// - Parameter urlSession: Custom `URLSession` to use for requests. If not provided, a default session will be created with the specified timeout.
public final class AudiencesClient: Sendable {
    public let commons: CommonsClient
    public let folderA: FolderAClient
    public let folderB: FolderBClient
    public let folderC: FolderCClient
    public let folderD: FolderDClient
    public let foo: FooClient
    private let httpClient: HTTPClient

    public init(
        baseURL: String = AudiencesEnvironment.environmentA.rawValue,
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
        self.folderA = FolderAClient(config: config)
        self.folderB = FolderBClient(config: config)
        self.folderC = FolderCClient(config: config)
        self.folderD = FolderDClient(config: config)
        self.foo = FooClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}