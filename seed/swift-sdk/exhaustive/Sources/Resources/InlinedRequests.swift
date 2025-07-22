public final class InlinedRequestsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func postWithObjectBodyandResponse(request: Any, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/req-bodies/object", 
            body: request, 
            requestOptions: requestOptions
        )
    }
}