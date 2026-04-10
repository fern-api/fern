import Foundation

/// Use this class to access the different functions within the SDK. You can instantiate any number of clients with different configuration that will propagate to these functions.
public final class ApiClient: Sendable {
    public let endpointsContainer: EndpointsContainerClient
    public let endpointsContentType: EndpointsContentTypeClient
    public let endpointsEnum: EndpointsEnumClient
    public let endpointsHttpMethods: EndpointsHttpMethodsClient
    public let endpointsObject: EndpointsObjectClient
    public let endpointsPagination: EndpointsPaginationClient
    public let endpointsParams: EndpointsParamsClient
    public let endpointsPrimitive: EndpointsPrimitiveClient
    public let endpointsPut: EndpointsPutClient
    public let endpointsUnion: EndpointsUnionClient
    public let endpointsUrLs: EndpointsUrLsClient
    public let inlinedrequests: InlinedrequestsClient
    public let noauth: NoauthClient
    public let noreqbody: NoreqbodyClient
    public let reqwithheaders: ReqwithheadersClient
    private let httpClient: HTTPClient

    /// Initialize the client with the specified configuration and a static bearer token.
    ///
    /// - Parameter baseURL: The base URL to use for requests from the client. If not provided, the default base URL will be used.
    /// - Parameter token: Bearer token for authentication. If provided, will be sent as "Bearer {token}" in Authorization header.
    /// - Parameter headers: Additional headers to send with each request.
    /// - Parameter timeout: Request timeout in seconds. Defaults to 60 seconds. Ignored if a custom `urlSession` is provided.
    /// - Parameter maxRetries: Maximum number of retries for failed requests. Defaults to 2.
    /// - Parameter urlSession: Custom `URLSession` to use for requests. If not provided, a default session will be created with the specified timeout.
    public convenience init(
        baseURL: String,
        token: String? = nil,
        headers: [String: String]? = nil,
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: Networking.URLSession? = nil
    ) {
        self.init(
            baseURL: baseURL,
            headerAuth: nil,
            bearerAuth: token.map {
                .init(token: .staticToken($0))
            },
            basicAuth: nil,
            headers: headers,
            timeout: timeout,
            maxRetries: maxRetries,
            urlSession: urlSession
        )
    }

    /// Initialize the client with the specified configuration and an async bearer token provider.
    ///
    /// - Parameter baseURL: The base URL to use for requests from the client. If not provided, the default base URL will be used.
    /// - Parameter token: An async function that returns the bearer token for authentication. If provided, will be sent as "Bearer {token}" in Authorization header.
    /// - Parameter headers: Additional headers to send with each request.
    /// - Parameter timeout: Request timeout in seconds. Defaults to 60 seconds. Ignored if a custom `urlSession` is provided.
    /// - Parameter maxRetries: Maximum number of retries for failed requests. Defaults to 2.
    /// - Parameter urlSession: Custom `URLSession` to use for requests. If not provided, a default session will be created with the specified timeout.
    public convenience init(
        baseURL: String,
        token: ClientConfig.CredentialProvider? = nil,
        headers: [String: String]? = nil,
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: Networking.URLSession? = nil
    ) {
        self.init(
            baseURL: baseURL,
            headerAuth: nil,
            bearerAuth: token.map {
                .init(token: .provider($0))
            },
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
        self.endpointsContainer = EndpointsContainerClient(config: config)
        self.endpointsContentType = EndpointsContentTypeClient(config: config)
        self.endpointsEnum = EndpointsEnumClient(config: config)
        self.endpointsHttpMethods = EndpointsHttpMethodsClient(config: config)
        self.endpointsObject = EndpointsObjectClient(config: config)
        self.endpointsPagination = EndpointsPaginationClient(config: config)
        self.endpointsParams = EndpointsParamsClient(config: config)
        self.endpointsPrimitive = EndpointsPrimitiveClient(config: config)
        self.endpointsPut = EndpointsPutClient(config: config)
        self.endpointsUnion = EndpointsUnionClient(config: config)
        self.endpointsUrLs = EndpointsUrLsClient(config: config)
        self.inlinedrequests = InlinedrequestsClient(config: config)
        self.noauth = NoauthClient(config: config)
        self.noreqbody = NoreqbodyClient(config: config)
        self.reqwithheaders = ReqwithheadersClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}