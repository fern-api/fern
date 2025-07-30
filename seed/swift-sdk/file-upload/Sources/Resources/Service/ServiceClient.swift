public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func post(request: any Codable, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func justFile(request: any Codable, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/just-file",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func justFileWithQueryParams(maybeString: String? = nil, integer: Int, maybeInteger: Int? = nil, listOfStrings: String, optionalListOfStrings: String? = nil, request: any Codable, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/just-file-with-query-params",
            queryParams: [
                "maybeString": maybeString.map { .string($0) }, 
                "integer": .int(integer), 
                "maybeInteger": maybeInteger.map { .int($0) }, 
                "listOfStrings": .string(listOfStrings), 
                "optionalListOfStrings": optionalListOfStrings.map { .string($0) }
            ],
            body: request,
            requestOptions: requestOptions
        )
    }

    public func withContentType(request: any Codable, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/with-content-type",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func withFormEncoding(request: any Codable, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/with-form-encoding",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func withFormEncodedContainers(request: any Codable, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func optionalArgs(request: any Codable, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/optional-args",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func simple(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/snippet",
            requestOptions: requestOptions
        )
    }
}