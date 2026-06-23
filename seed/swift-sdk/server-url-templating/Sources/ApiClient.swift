import Foundation

/// Use this class to access the different functions within the SDK. You can instantiate any number of clients with different configuration that will propagate to these functions.
public final class ApiClient: Sendable {
    private let httpClient: HTTPClient

    /// Initialize the client with the specified configuration.
    ///
    /// - Parameter environment: The environment to use for requests from the client. If not provided, the default environment will be used.
    /// - Parameter headers: Additional headers to send with each request.
    /// - Parameter timeout: Request timeout in seconds. Defaults to 60 seconds. Ignored if a custom `urlSession` is provided.
    /// - Parameter maxRetries: Maximum number of retries for failed requests. Defaults to 2.
    /// - Parameter urlSession: Custom `URLSession` to use for requests. If not provided, a default session will be created with the specified timeout.
    public convenience init(
        environment: ApiEnvironment = ApiEnvironment.regionalApiServer,
        headers: [String: String]? = nil,
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: Networking.URLSession? = nil
    ) {
        self.init(
            environment: environment,
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
        environment: ApiEnvironment,
        headerAuth: ClientConfig.HeaderAuth? = nil,
        bearerAuth: ClientConfig.BearerAuth? = nil,
        basicAuth: ClientConfig.BasicAuth? = nil,
        headers: [String: String]? = nil,
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: Networking.URLSession? = nil
    ) {
        let config = ClientConfig(
            baseURL: "",
            baseURLs: [
                "Base": environment.base, 
                "Auth": environment.auth
            ],
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

    public func getUsers(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            baseUrlId: "Base",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getUser(userId: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/\(userId)",
            baseUrlId: "Base",
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    public func getToken(request: Requests.TokenRequest, requestOptions: RequestOptions? = nil) async throws -> TokenResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/auth/token",
            baseUrlId: "Auth",
            body: request,
            requestOptions: requestOptions,
            responseType: TokenResponse.self
        )
    }
}