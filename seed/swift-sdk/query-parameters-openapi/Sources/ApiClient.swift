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

    public func search(limit: Int, id: String, date: CalendarDate, deadline: Date, bytes: String, user: User, userList: Nullable<User>? = nil, optionalDeadline: Nullable<Date>? = nil, keyValue: Nullable<[String: Nullable<String>]>? = nil, optionalString: Nullable<String>? = nil, nestedUser: Nullable<NestedUser>? = nil, optionalUser: Nullable<User>? = nil, excludeUser: Nullable<User>? = nil, filter: Nullable<String>? = nil, tags: Nullable<String>? = nil, optionalTags: Nullable<String>? = nil, neighbor: Nullable<SearchRequestNeighbor>? = nil, neighborRequired: User, requestOptions: RequestOptions? = nil) async throws -> SearchResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/user/getUsername",
            queryParams: [
                "limit": .int(limit), 
                "id": .string(id), 
                "date": .calendarDate(date), 
                "deadline": .date(deadline), 
                "bytes": .string(bytes), 
                "user": .unknown(user), 
                "userList": userList?.wrappedValue.map { .unknown($0) }, 
                "optionalDeadline": optionalDeadline?.wrappedValue.map { .date($0) }, 
                "keyValue": keyValue?.wrappedValue.map { .unknown($0) }, 
                "optionalString": optionalString?.wrappedValue.map { .string($0) }, 
                "nestedUser": nestedUser?.wrappedValue.map { .unknown($0) }, 
                "optionalUser": optionalUser?.wrappedValue.map { .unknown($0) }, 
                "excludeUser": excludeUser?.wrappedValue.map { .unknown($0) }, 
                "filter": filter?.wrappedValue.map { .string($0) }, 
                "tags": tags?.wrappedValue.map { .string($0) }, 
                "optionalTags": optionalTags?.wrappedValue.map { .string($0) }, 
                "neighbor": neighbor?.wrappedValue.map { .unknown($0) }, 
                "neighborRequired": .unknown(neighborRequired)
            ],
            requestOptions: requestOptions,
            responseType: SearchResponse.self
        )
    }
}