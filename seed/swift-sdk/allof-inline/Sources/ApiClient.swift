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
        baseURL: String = ApiEnvironment.default.rawValue,
        headers: [String: String]? = nil,
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: Networking.URLSession? = nil
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
        urlSession: Networking.URLSession? = nil
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

    public func searchRuleTypes(query: String? = nil, requestOptions: RequestOptions? = nil) async throws -> RuleTypeSearchResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/rule-types",
            queryParams: [
                "query": query.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: RuleTypeSearchResponse.self
        )
    }

    public func createRule(request: Requests.RuleCreateRequest, requestOptions: RequestOptions? = nil) async throws -> RuleResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/rules",
            body: request,
            requestOptions: requestOptions,
            responseType: RuleResponse.self
        )
    }

    public func listUsers(requestOptions: RequestOptions? = nil) async throws -> UserSearchResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            requestOptions: requestOptions,
            responseType: UserSearchResponse.self
        )
    }

    public func getEntity(requestOptions: RequestOptions? = nil) async throws -> CombinedEntity {
        return try await httpClient.performRequest(
            method: .get,
            path: "/entities",
            requestOptions: requestOptions,
            responseType: CombinedEntity.self
        )
    }

    public func getOrganization(requestOptions: RequestOptions? = nil) async throws -> Organization {
        return try await httpClient.performRequest(
            method: .get,
            path: "/organizations",
            requestOptions: requestOptions,
            responseType: Organization.self
        )
    }
}