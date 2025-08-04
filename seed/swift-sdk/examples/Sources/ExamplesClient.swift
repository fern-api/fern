public final class ExamplesClient: Sendable {
    public let commons: CommonsClient
    public let file: FileClient
    public let health: HealthClient
    public let service: ServiceClient_
    public let types: TypesClient_
    private let httpClient: HTTPClient

    public init(
        baseURL: String = ExamplesEnvironment.production.rawValue,
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
        self.health = HealthClient(config: config)
        self.service = ServiceClient_(config: config)
        self.types = TypesClient_(config: config)
        self.httpClient = HTTPClient(config: config)
    }

    public func echo(request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func createType(request: Type, requestOptions: RequestOptions? = nil) async throws -> Identifier {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            body: request,
            requestOptions: requestOptions,
            responseType: Identifier.self
        )
    }
}