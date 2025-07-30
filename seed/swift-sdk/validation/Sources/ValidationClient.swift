public final class ValidationClient: Sendable {
    private let httpClient: HTTPClient

    public init(
        baseURL: String,
        apiKey: String,
        token: String? = nil,
        headers: [String: String]? = [:],
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        urlSession: URLSession? = nil
    ) {
        let config = ClientConfig(
            baseURL: baseURL,
            apiKey: apiKey,
            token: token,
            headers: headers,
            timeout: timeout,
            urlSession: urlSession
        )
        self.httpClient = HTTPClient(config: config)
    }

    public func create(request: CreateRequest, requestOptions: RequestOptions? = nil) async throws -> Type {
        return try await httpClient.performRequest(
            method: .post,
            path: "/create",
            body: request,
            requestOptions: requestOptions,
            responseType: Type.self
        )
    }

    public func get(decimal: Double, even: Int, name: String, requestOptions: RequestOptions? = nil) async throws -> Type {
        return try await httpClient.performRequest(
            method: .get,
            path: "/",
            queryParams: [
                "decimal": .double(decimal), 
                "even": .int(even), 
                "name": .string(name)
            ],
            requestOptions: requestOptions,
            responseType: Type.self
        )
    }
}