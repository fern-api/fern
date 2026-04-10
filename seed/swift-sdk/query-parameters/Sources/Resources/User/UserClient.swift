import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getusername(limit: Int, id: String, date: CalendarDate, deadline: Date, bytes: String, user: User, userList: User? = nil, optionalDeadline: Nullable<Date>? = nil, keyValue: [String: String], optionalString: Nullable<String>? = nil, nestedUser: NestedUser, optionalUser: User? = nil, excludeUser: User? = nil, filter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .get,
            path: "/user",
            queryParams: [
                "limit": .int(limit), 
                "id": .string(id), 
                "date": .calendarDate(date), 
                "deadline": .date(deadline), 
                "bytes": .string(bytes), 
                "user": .unknown(user), 
                "userList": userList.map { .unknown($0) }, 
                "optionalDeadline": optionalDeadline?.wrappedValue.map { .date($0) }, 
                "keyValue": .unknown(keyValue), 
                "optionalString": optionalString?.wrappedValue.map { .string($0) }, 
                "nestedUser": .unknown(nestedUser), 
                "optionalUser": optionalUser.map { .unknown($0) }, 
                "excludeUser": excludeUser.map { .unknown($0) }, 
                "filter": filter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: User.self
        )
    }
}