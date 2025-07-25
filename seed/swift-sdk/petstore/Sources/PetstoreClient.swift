public final class PetstoreClient: Sendable {
    public let pet: PetClient
    public let store: StoreClient
    public let user: UserClient
    private let config: ClientConfig

    public init(
        baseURL: String = PetstoreEnvironment.default.rawValue,
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
        self.pet = PetClient(config: config)
        self.store = StoreClient(config: config)
        self.user = UserClient(config: config)
    }
}