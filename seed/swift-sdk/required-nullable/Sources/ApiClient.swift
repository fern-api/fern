import Foundation

/// Use this class to access the different functions within the SDK. You can instantiate any number of clients with different configuration that will propagate to these functions.
public final class ApiClient: Sendable {
    private let httpClient: HTTPClient

    /// Initialize the client with the specified configuration.
    ///
    /// - Parameter baseURL: The base URL to use for requests from the client. If not provided, the default base URL will be used.
    /// - Parameter headers: Additional headers to send with each request.
    /// - Parameter timeout: Request timeout in seconds. Defaults to 60 seconds. Ignored if a custom `urlSession` is provided.
    /// - Parameter maxRetries: Maximum number of retries for failed requests. Defaults to 2.
    /// - Parameter urlSession: Custom `URLSession` to use for requests. If not provided, a default session will be created with the specified timeout.
    public convenience init(
        baseURL: String,
        headers: [String: String]? = nil,
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: URLSession? = nil
    ) {
        self.init(
            baseURL: baseURL,
            headerAuth: nil,
            bearerAuth: nil,
            basicAuth: nil,
            headers: headers,
            timeout: timeout,
            maxRetries: maxRetries,
            urlSession: urlSession
        )
    }

    init(
        baseURL: String,
        headerAuth: ClientConfig.HeaderAuth? = nil,
        bearerAuth: ClientConfig.BearerAuth? = nil,
        basicAuth: ClientConfig.BasicAuth? = nil,
        headers: [String: String]? = nil,
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: URLSession? = nil
    ) {
        let config = ClientConfig(
            baseURL: baseURL,
            headerAuth: headerAuth,
            bearerAuth: bearerAuth,
            basicAuth: basicAuth,
            headers: headers,
            timeout: timeout,
            maxRetries: maxRetries,
            urlSession: urlSession
        )
        self.httpClient = HTTPClient(config: config)
    }

    public func getFoo(optionalBaz: String? = nil, optionalNullableBaz: Nullable<String>? = nil, requiredBaz: String, requiredNullableBaz: Nullable<String>, requestOptions: RequestOptions? = nil) async throws -> Foo {
        return try await httpClient.performRequest(
            method: .get,
            path: "/foo",
            queryParams: [
                "optional_baz": optionalBaz.map { .string($0) }, 
                "optional_nullable_baz": optionalNullableBaz?.wrappedValue.map { .string($0) }, 
                "required_baz": .string(requiredBaz), 
                "required_nullable_baz": requiredNullableBaz.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: Foo.self
        )
    }

    public func updateFoo(id: String, xIdempotencyKey: String, request: Requests.UpdateFooRequest, requestOptions: RequestOptions? = nil) async throws -> Foo {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/foo/\(id)",
            headers: [
                "X-Idempotency-Key": xIdempotencyKey
            ],
            body: request,
            requestOptions: requestOptions,
            responseType: Foo.self
        )
    }
}