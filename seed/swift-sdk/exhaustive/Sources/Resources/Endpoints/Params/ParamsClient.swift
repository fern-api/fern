import Foundation

public final class ParamsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// GET with path param
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithPath(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/params/path/\(param)",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// GET with path param
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithInlinePath(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/params/path/\(param)",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// GET with query param
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithQuery(query: String, number: Int, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/params",
            queryParams: [
                "query": .string(query), 
                "number": .int(number)
            ],
            requestOptions: requestOptions
        )
    }

    /// GET with multiple of same query param
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithAllowMultipleQuery(query: [String], number: [Int], requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/params",
            queryParams: [
                "query": .stringArray(query), 
                "number": .unknown(number)
            ],
            requestOptions: requestOptions
        )
    }

    /// GET with path and query params
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithPathAndQuery(param: String, query: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/params/path-query/\(param)",
            queryParams: [
                "query": .string(query)
            ],
            requestOptions: requestOptions
        )
    }

    /// GET with path and query params
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithInlinePathAndQuery(param: String, query: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/params/path-query/\(param)",
            queryParams: [
                "query": .string(query)
            ],
            requestOptions: requestOptions
        )
    }

    /// PUT to update with path param
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func modifyWithPath(param: String, request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .put,
            path: "/params/path/\(param)",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// PUT to update with path param
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func modifyWithInlinePath(param: String, request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .put,
            path: "/params/path/\(param)",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// POST bytes with path param returning object
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func uploadWithPath(param: String, request: Data, requestOptions: RequestOptions? = nil) async throws -> ObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/params/path/\(param)",
            contentType: .applicationOctetStream,
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithRequiredField.self
        )
    }

    /// POST with referenced body + query params
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createWithBodyAndQuery(fields: String? = nil, request: ObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/params/body-and-query",
            queryParams: [
                "_fields": fields.map { .string($0) }
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }

    /// POST bytes body + query params
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func uploadBytesWithQuery(fields: String? = nil, request: Data, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/params/bytes-and-query",
            contentType: .applicationOctetStream,
            queryParams: [
                "_fields": fields.map { .string($0) }
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }

    /// GET with boolean path param
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithBooleanPath(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/params/path-bool/\(param)",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// GET with path param that can throw errors
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithPathAndErrors(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/params/path/\(param)",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}