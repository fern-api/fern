public final class ContentTypeClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func postJsonPatchContentType(request: ObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/foo/bar", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func postJsonPatchContentWithCharsetType(request: ObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/foo/baz", 
            body: request, 
            requestOptions: requestOptions
        )
    }
}