public final class ApiClient: Sendable {
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
                "user": .string(user.rawValue), 
                "userList": userList.map { .string($0.rawValue) }, 
                "optionalDeadline": optionalDeadline.map { .date($0) }, 
                "keyValue": keyValue.map { .unknown($0) }, 
                "optionalString": optionalString.map { .string($0) }, 
                "nestedUser": nestedUser.map { .string($0.rawValue) }, 
                "optionalUser": optionalUser.map { .string($0.rawValue) }, 
                "excludeUser": excludeUser.map { .string($0.rawValue) }, 
                "filter": filter.map { .string($0) }, 
                "neighbor": neighbor.map { .string($0.rawValue) }, 
                "neighborRequired": .string(neighborRequired.rawValue)
            ],
            requestOptions: requestOptions,
            responseType: SearchResponse.self
        )
    }
}