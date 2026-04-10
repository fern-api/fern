import Foundation

public final class EndpointsParamsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// GET with path param
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func endpointsParamsGetWithPath(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/params/path/\(param)",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// POST bytes with path param returning object
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func endpointsParamsUploadWithPath(param: String, request: Data, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/params/path/\(param)",
            contentType: .applicationOctetStream,
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithRequiredField.self
        )
    }

    /// PUT to update with path param
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func endpointsParamsModifyWithPath(param: String, request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .put,
            path: "/params/path/\(param)",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// GET with path param
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func endpointsParamsGetWithInlinePath(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/params/inline-path/\(param)",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// PUT to update with path param
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func endpointsParamsModifyWithInlinePath(param: String, request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .put,
            path: "/params/inline-path/\(param)",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// GET with query param
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func endpointsParamsGetWithQuery(query: String, number: Int, requestOptions: RequestOptions? = nil) async throws -> Void {
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
    public func endpointsParamsGetWithAllowMultipleQuery(query: String? = nil, number: Int? = nil, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/params/allow-multiple",
            queryParams: [
                "query": query.map { .string($0) }, 
                "number": number.map { .int($0) }
            ],
            requestOptions: requestOptions
        )
    }

    /// GET with path and query params
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func endpointsParamsGetWithPathAndQuery(param: String, query: String, requestOptions: RequestOptions? = nil) async throws -> Void {
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
    public func endpointsParamsGetWithInlinePathAndQuery(param: String, query: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/params/inline-path-query/\(param)",
            queryParams: [
                "query": .string(query)
            ],
            requestOptions: requestOptions
        )
    }

    /// GET with boolean path param
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func endpointsParamsGetWithBooleanPath(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
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
    public func endpointsParamsGetWithPathAndErrors(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/params/path-with-errors/\(param)",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}