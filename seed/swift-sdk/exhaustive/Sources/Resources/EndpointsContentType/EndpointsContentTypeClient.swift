import Foundation

public final class EndpointsContentTypeClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func endpointsContentTypePostJsonPatchContentType(request: TypesObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/foo/bar",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func endpointsContentTypePostJsonPatchContentWithCharsetType(request: TypesObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/foo/baz",
            body: request,
            requestOptions: requestOptions
        )
    }
}