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

    public func search(limit: Int, id: String, date: String, deadline: Date, bytes: String, user: User, userList: User? = nil, optionalDeadline: Date? = nil, keyValue: [String: String?]? = nil, optionalString: String? = nil, nestedUser: NestedUser? = nil, optionalUser: User? = nil, excludeUser: User? = nil, filter: String? = nil, neighbor: User? = nil, neighborRequired: SearchRequestNeighborRequired, requestOptions: RequestOptions? = nil) async throws -> SearchResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/user/getUsername",
            queryParams: [
                "limit": .int(limit), 
                "id": .string(id), 
                "date": .string(date), 
                "deadline": .date(deadline), 
                "bytes": .string(bytes), 
                "user": .unknown(user), 
                "userList": userList.map { .unknown($0) }, 
                "optionalDeadline": optionalDeadline.map { .date($0) }, 
                "keyValue": keyValue.map { .unknown($0) }, 
                "optionalString": optionalString.map { .string($0) }, 
                "nestedUser": nestedUser.map { .unknown($0) }, 
                "optionalUser": optionalUser.map { .unknown($0) }, 
                "excludeUser": excludeUser.map { .unknown($0) }, 
                "filter": filter.map { .string($0) }, 
                "neighbor": neighbor.map { .unknown($0) }, 
                "neighborRequired": .unknown(neighborRequired)
            ],
            requestOptions: requestOptions,
            responseType: SearchResponse.self
        )
    }
}