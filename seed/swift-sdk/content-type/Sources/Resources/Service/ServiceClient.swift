import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func patch(request: PatchProxyRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// Update with JSON merge patch - complex types
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func patchComplex(id: String, request: PatchComplexRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/complex/\(id)",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// Regular PATCH endpoint without merge-patch semantics
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func regularPatch(id: String, request: RegularPatchRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/regular/\(id)",
            body: request,
            requestOptions: requestOptions
        )
    }
}