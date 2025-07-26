public final class CrossPackageTypeNamesClient: Sendable {
    public let commons: CommonsClient
    public let folderA: FolderAClient
    public let folderB: FolderBClient
    public let folderC: FolderCClient
    public let folderD: FolderDClient
    public let foo: FooClient
    private let config: ClientConfig

    public init(
        baseURL: String,
        apiKey: String,
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
        self.commons = CommonsClient(config: config)
        self.folderA = FolderAClient(config: config)
        self.folderB = FolderBClient(config: config)
        self.folderC = FolderCClient(config: config)
        self.folderD = FolderDClient(config: config)
        self.foo = FooClient(config: config)
    }
}