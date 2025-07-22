public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func endpoint(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/service", 
            requestOptions: requestOptions, 
            responseType: Any.self
        )
    }

    public func unknownRequest(request: Any, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/service", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: Any.self
        )
    }
}