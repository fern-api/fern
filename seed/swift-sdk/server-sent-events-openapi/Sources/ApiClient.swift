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

    /// Uses discriminator with mapping, x-fern-discriminator-context set to protocol. Because the discriminant is at the protocol level, the data field can be any type or absent entirely. Demonstrates heartbeat (no data), string literal, number literal, and object data payloads.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func streamProtocolNoCollision(request: StreamRequest, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream/protocol-no-collision",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }

    /// Same as endpoint 1, but the object data payload contains its own "event" property, which collides with the SSE envelope's "event" discriminator field. Tests whether generators correctly separate the protocol-level discriminant from the data-level field when context=protocol is specified.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func streamProtocolCollision(request: StreamRequest, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream/protocol-collision",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }

    /// x-fern-discriminator-context is explicitly set to "data" (the default value). Each variant uses allOf to extend a payload schema and adds the "event" discriminant property at the same level. There is no "data" wrapper. The discriminant and payload fields coexist in a single flat object. This matches the real-world pattern used by customers with context=data.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func streamDataContext(request: StreamRequest, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream/data-context",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }

    /// The x-fern-discriminator-context extension is omitted entirely. Tests whether Fern correctly infers the default behavior (context=data) when the extension is absent. Same flat allOf pattern as endpoint 3.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func streamNoContext(request: StreamRequest, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream/no-context",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }

    /// Mismatched combination: context=protocol with the flat allOf schema pattern that is normally used with context=data. Shows what happens when the discriminant is declared as protocol-level but the schema uses allOf to flatten the event field alongside payload fields instead of wrapping them in a data field.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func streamProtocolWithFlatSchema(request: StreamRequest, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream/protocol-with-flat-schema",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }

    /// Mismatched combination: context=data with the envelope+data schema pattern that is normally used with context=protocol. Shows what happens when the discriminant is declared as data-level but the schema separates the event field and data field into an envelope structure.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func streamDataContextWithEnvelopeSchema(request: StreamRequest, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream/data-context-with-envelope-schema",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }

    /// Follows the pattern from the OAS 3.2 specification's own SSE example. The itemSchema extends a base Event schema via $ref and uses inline oneOf variants with const on the event field to distinguish event types. Data fields use contentSchema/contentMediaType for structured payloads. No discriminator object is used. Event type resolution relies on const matching.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func streamOasSpecNative(request: StreamRequest, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream/oas-spec-native",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }
}