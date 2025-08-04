public final class ApiClient: Sendable {
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
        self.httpClient = HTTPClient(config: config)
    }

    public func getAccount(accountId: String, requestOptions: RequestOptions? = nil) async throws -> Account {
        return try await httpClient.performRequest(
            method: .get,
            path: "/account/\(accountId)",
            requestOptions: requestOptions,
            responseType: Account.self
        )
    }
}