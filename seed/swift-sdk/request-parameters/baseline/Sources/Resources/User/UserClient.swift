import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createUsername(tags: [String], request: Requests.CreateUsernameRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/user/username",
            queryParams: [
                "tags": .stringArray(tags)
            ],
            body: request,
            requestOptions: requestOptions
        )
    }

    public func createUsernameWithReferencedType(tags: [String], request: CreateUsernameBody, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/user/username-referenced",
            queryParams: [
                "tags": .stringArray(tags)
            ],
            body: request,
            requestOptions: requestOptions
        )
    }

    public func createUsernameOptional(request: Nullable<CreateUsernameBodyOptionalProperties>?, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/user/username-optional",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func getUsername(limit: Int, id: UUID, date: CalendarDate, deadline: Date, bytes: String, user: User, userList: [User], optionalDeadline: Date? = nil, keyValue: [String: String], optionalString: String? = nil, nestedUser: NestedUser, optionalUser: User? = nil, excludeUser: User, filter: String, longParam: Int64, bigIntParam: String, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get,
            path: "/user",
            queryParams: [
                "limit": .int(limit), 
                "id": .uuid(id), 
                "date": .calendarDate(date), 
                "deadline": .date(deadline), 
                "bytes": .string(bytes), 
                "user": .unknown(user), 
                "userList": .unknown(userList), 
                "optionalDeadline": optionalDeadline.map { .date($0) }, 
                "keyValue": .unknown(keyValue), 
                "optionalString": optionalString.map { .string($0) }, 
                "nestedUser": .unknown(nestedUser), 
                "optionalUser": optionalUser.map { .unknown($0) }, 
                "excludeUser": .unknown(excludeUser), 
                "filter": .string(filter), 
                "longParam": .int64(longParam), 
                "bigIntParam": .string(bigIntParam)
            ],
            requestOptions: requestOptions,
            responseType: User.self
        )
    }
}