public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithApiKey(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/apiKey", 
            requestOptions: requestOptions, 
            responseType: String.self
        )
    }

    public func getWithHeader(xEndpointHeader: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/apiKeyInHeader", 
            headers: [
                "X-Endpoint-Header": xEndpointHeader
            ], 
            requestOptions: requestOptions, 
            responseType: String.self
        )
    }
}