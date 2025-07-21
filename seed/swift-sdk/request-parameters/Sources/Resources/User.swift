public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createUsername(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/user/username", 
            requestOptions: requestOptions
        )
    }

    public func getUsername(limit: Int, id: UUID, date: Date, deadline: Date, bytes: String, user: User, userList: [User], optionalDeadline: Date? = nil, keyValue: Any, optionalString: String? = nil, nestedUser: NestedUser, optionalUser: User? = nil, excludeUser: User, filter: String, longParam: Int64, bigIntParam: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/user", 
            queryParams: [
                "limit": limit, 
                "id": id, 
                "date": date, 
                "deadline": deadline, 
                "bytes": bytes, 
                "user": user.rawValue, 
                "userList": userList, 
                "optionalDeadline": optionalDeadline.map { .string($0) }, 
                "keyValue": keyValue, 
                "optionalString": optionalString.map { .string($0) }, 
                "nestedUser": nestedUser.rawValue, 
                "optionalUser": optionalUser.map { .string($0) }, 
                "excludeUser": excludeUser.rawValue, 
                "filter": filter, 
                "longParam": longParam, 
                "bigIntParam": bigIntParam
            ], 
            requestOptions: requestOptions
        )
    }
}