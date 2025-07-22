public final class ParamsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithPath(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/params/path/\(param)", 
            requestOptions: requestOptions, 
            responseType: String.self
        )
    }

    public func getWithInlinePath(param: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/params/path/\(param)", 
            requestOptions: requestOptions, 
            responseType: String.self
        )
    }

    public func getWithQuery(query: String, number: Int, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/params", 
            queryParams: [
                "query": .string(query), 
                "number": .string(number)
            ], 
            requestOptions: requestOptions, 
            responseType: Any.self
        )
    }

    public func getWithAllowMultipleQuery(query: String, number: Int, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/params", 
            queryParams: [
                "query": .string(query), 
                "number": .string(number)
            ], 
            requestOptions: requestOptions, 
            responseType: Any.self
        )
    }

    public func getWithPathAndQuery(param: String, query: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/params/path-query/\(param)", 
            queryParams: [
                "query": .string(query)
            ], 
            requestOptions: requestOptions, 
            responseType: Any.self
        )
    }

    public func getWithInlinePathAndQuery(param: String, query: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/params/path-query/\(param)", 
            queryParams: [
                "query": .string(query)
            ], 
            requestOptions: requestOptions, 
            responseType: Any.self
        )
    }

    public func modifyWithPath(param: String, request: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .put, 
            path: "/params/path/\(param)", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: String.self
        )
    }

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