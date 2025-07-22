public final class FooClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func find(optionalString: OptionalString, request: Any, requestOptions: RequestOptions? = nil) async throws -> ImportingType {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/", 
            queryParams: [
                "optionalString": .string(optionalString.rawValue)
            ], 
            body: request, 
            requestOptions: requestOptions, 
            responseType: ImportingType.self
        )
    }
}