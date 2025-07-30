public final class HeadersClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(endpointVersion: JSONValue, async: JSONValue, request: SendLiteralsInHeadersRequest, requestOptions: RequestOptions? = nil) async throws -> SendResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/headers",
            headers: [
                "endpointVersion": endpointVersion, 
                "async": async
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: SendResponse.self
        )
    }
}