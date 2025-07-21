public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func post(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/", 
            requestOptions: requestOptions
        )
    }

    public func justFile(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/just-file", 
            requestOptions: requestOptions
        )
    }

    public func justFileWithQueryParams(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/just-file-with-query-params", 
            requestOptions: requestOptions
        )
    }

    public func withContentType(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/with-content-type", 
            requestOptions: requestOptions
        )
    }

    public func withFormEncoding(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/with-form-encoding", 
            requestOptions: requestOptions
        )
    }

    public func withFormEncodedContainers(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/", 
            requestOptions: requestOptions
        )
    }

    public func optionalArgs(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/optional-args", 
            requestOptions: requestOptions
        )
    }

    public func simple(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/snippet", 
            requestOptions: requestOptions
        )
    }
}