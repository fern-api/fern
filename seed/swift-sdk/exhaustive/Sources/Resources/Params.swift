public final class ParamsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithPath(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/params/path/\(param)", 
            requestOptions: requestOptions
        )
    }

    public func getWithInlinePath(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/params/path/\(param)", 
            requestOptions: requestOptions
        )
    }

    public func getWithQuery(query: String, number: Int, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/params", 
            queryParams: [
                "query": query, 
                "number": number
            ], 
            requestOptions: requestOptions
        )
    }

    public func getWithAllowMultipleQuery(query: String, number: Int, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/params", 
            queryParams: [
                "query": query, 
                "number": number
            ], 
            requestOptions: requestOptions
        )
    }

    public func getWithPathAndQuery(param: String, query: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/params/path-query/\(param)", 
            queryParams: [
                "query": query
            ], 
            requestOptions: requestOptions
        )
    }

    public func getWithInlinePathAndQuery(param: String, query: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/params/path-query/\(param)", 
            queryParams: [
                "query": query
            ], 
            requestOptions: requestOptions
        )
    }

    public func modifyWithPath(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .put, 
            path: "/params/path/\(param)", 
            requestOptions: requestOptions
        )
    }

    public func modifyWithInlinePath(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .put, 
            path: "/params/path/\(param)", 
            requestOptions: requestOptions
        )
    }
}