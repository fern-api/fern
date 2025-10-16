import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getUsername(limit: Int, id: UUID, date: CalendarDate, deadline: Date, bytes: String, user: User, userList: [User], optionalDeadline: Date? = nil, keyValue: [String: String], optionalString: String? = nil, nestedUser: NestedUser, optionalUser: User? = nil, excludeUser: User, filter: String, requestOptions: RequestOptions? = nil) async throws -> User {
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
                "filter": .string(filter)
            ],
            requestOptions: requestOptions,
            responseType: User.self
        )
    }
}