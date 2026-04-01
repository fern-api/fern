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

    /// POST with boolean literal in request body to test that snippets wrap boolean literals correctly
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postWithBooleanLiteralInRequest(request: Requests.PostWithBooleanLiteralRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/req-bodies/boolean-literal",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// GET with enum path parameter to test that enum path params emit string wire values instead of enum case shorthand
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithEnumPathParam(weather: String, query: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/req-bodies/enum/\(weather)",
            queryParams: [
                "query": .string(query)
            ],
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// POST returning ChildResource to test that inherited property ordering matches Swift struct initializer order
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func postWithChildResource(request: Requests.PostWithChildResource, requestOptions: RequestOptions? = nil) async throws -> ChildResource {
        return try await httpClient.performRequest(
            method: .post,
            path: "/req-bodies/child-resource",
            body: request,
            requestOptions: requestOptions,
            responseType: ChildResource.self
        )
    }
}