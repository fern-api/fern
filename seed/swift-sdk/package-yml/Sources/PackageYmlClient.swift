public final class PackageYmlClient: Sendable {
    public let service: ServiceClient
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
        self.service = ServiceClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }

    public func echo(id: String, request: EchoRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/\(id)",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}