public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createUsername(request: CreateUsernameRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/user/username",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func getUsername(limit: Int, id: UUID, date: Date, deadline: Date, bytes: String, user: User, userList: [User], optionalDeadline: Date? = nil, keyValue: [String: String], optionalString: String? = nil, nestedUser: NestedUser, optionalUser: User? = nil, excludeUser: User, filter: String, longParam: Int64, bigIntParam: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get,
            path: "/user",
            queryParams: [
                "limit": .int(limit), 
                "id": .uuid(id), 
                "date": .date(date), 
                "deadline": .date(deadline), 
                "bytes": .string(bytes), 
                "user": .string(user.rawValue), 
                "userList": .stringArray(userList), 
                "optionalDeadline": optionalDeadline.map { .date($0) }, 
                "keyValue": .unknown(keyValue), 
                "optionalString": optionalString.map { .string($0) }, 
                "nestedUser": .string(nestedUser.rawValue), 
                "optionalUser": optionalUser.map { .string($0.rawValue) }, 
                "excludeUser": .string(excludeUser.rawValue), 
                "filter": .string(filter), 
                "longParam": .int64(longParam), 
                "bigIntParam": .string(bigIntParam)
            ],
            requestOptions: requestOptions,
            responseType: User.self
        )
    }
}