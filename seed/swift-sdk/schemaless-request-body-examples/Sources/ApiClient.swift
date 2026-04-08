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

    /// Creates a plant with example JSON but no request body schema.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createPlant(request: JSONValue, requestOptions: RequestOptions? = nil) async throws -> CreatePlantResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/plants",
            body: request,
            requestOptions: requestOptions,
            responseType: CreatePlantResponse.self
        )
    }

    /// Updates a plant with example JSON but no request body schema.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updatePlant(plantId: String, request: JSONValue, requestOptions: RequestOptions? = nil) async throws -> UpdatePlantResponse {
        return try await httpClient.performRequest(
            method: .put,
            path: "/plants/\(plantId)",
            body: request,
            requestOptions: requestOptions,
            responseType: UpdatePlantResponse.self
        )
    }

    /// A control endpoint that has both schema and example defined.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createPlantWithSchema(request: Requests.CreatePlantWithSchemaRequest, requestOptions: RequestOptions? = nil) async throws -> CreatePlantWithSchemaResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/plants/with-schema",
            body: request,
            requestOptions: requestOptions,
            responseType: CreatePlantWithSchemaResponse.self
        )
    }
}