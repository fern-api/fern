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
                "limit": .string(limit), 
                "id": .string(id), 
                "date": .string(date), 
                "deadline": .string(deadline), 
                "bytes": .string(bytes), 
                "user": .string(user.rawValue), 
                "userList": .string(userList), 
                "optionalDeadline": optionalDeadline.map { .string($0) }, 
                "keyValue": .string(keyValue), 
                "optionalString": optionalString.map { .string($0) }, 
                "nestedUser": .string(nestedUser.rawValue), 
                "optionalUser": optionalUser.map { .string($0) }, 
                "excludeUser": .string(excludeUser.rawValue), 
                "filter": .string(filter), 
                "longParam": .string(longParam), 
                "bigIntParam": .string(bigIntParam)
            ], 
            requestOptions: requestOptions
        )
    }
}