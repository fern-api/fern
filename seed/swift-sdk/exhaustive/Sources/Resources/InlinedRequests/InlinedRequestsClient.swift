import Foundation

public final class InlinedRequestsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// POST with custom object in request body, response is an object
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postWithObjectBodyandResponse(request: Requests.PostWithObjectBody, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/req-bodies/object",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }

    /// POST with root-level array body and header params
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postWithArrayBodyAndHeaders(xCustomHeader: String? = nil, request: [String], requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/req-bodies/array-body-with-headers",
            headers: [
                "X-Custom-Header": xCustomHeader
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}