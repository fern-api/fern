public final class UnknownClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func post(request: Any, requestOptions: RequestOptions? = nil) async throws -> [Any] {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: [Any].self
        )
    }

    public func postObject(request: MyObject, requestOptions: RequestOptions? = nil) async throws -> [Any] {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/with-object", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: [Any].self
        )
    }
}