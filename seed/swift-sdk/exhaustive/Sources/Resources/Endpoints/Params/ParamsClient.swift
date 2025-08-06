public final class ParamsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
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
    public func getWithAllowMultipleQuery(query: String, number: Int, requestOptions: RequestOptions? = nil) async throws -> Void {
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
}