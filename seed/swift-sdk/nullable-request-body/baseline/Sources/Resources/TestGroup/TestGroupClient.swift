import Foundation

public final class TestGroupClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Post a nullable request body
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func testMethodName(pathParam: String, queryParamObject: Nullable<PlainObject>? = nil, queryParamInteger: Nullable<Int>? = nil, request: Nullable<PlainObject>, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/optional-request-body/\(pathParam)",
            queryParams: [
                "query_param_object": queryParamObject?.wrappedValue.map { .unknown($0) }, 
                "query_param_integer": queryParamInteger?.wrappedValue.map { .int($0) }
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }
}