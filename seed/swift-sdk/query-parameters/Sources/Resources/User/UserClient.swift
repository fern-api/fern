import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import QueryParameters
    ///
    /// private func main() async throws {
    ///     let client = QueryParametersClient()
    ///
    ///     _ = try await client.user.getUsername(
    ///         limit: 1,
    ///         id: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///         date: CalendarDate("2023-01-15")!,
    ///         deadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///         bytes: "SGVsbG8gd29ybGQh",
    ///         user: User(
    ///             name: "name",
    ///             tags: [
    ///                 "tags",
    ///                 "tags"
    ///             ]
    ///         ),
    ///         userList: [
    ///             User(
    ///                 name: "name",
    ///                 tags: [
    ///                     "tags",
    ///                     "tags"
    ///                 ]
    ///             ),
    ///             User(
    ///                 name: "name",
    ///                 tags: [
    ///                     "tags",
    ///                     "tags"
    ///                 ]
    ///             )
    ///         ],
    ///         optionalDeadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///         keyValue: [
    ///             "keyValue": "keyValue"
    ///         ],
    ///         optionalString: "optionalString",
    ///         nestedUser: NestedUser(
    ///             name: "name",
    ///             user: User(
    ///                 name: "name",
    ///                 tags: [
    ///                     "tags",
    ///                     "tags"
    ///                 ]
    ///             )
    ///         ),
    ///         optionalUser: User(
    ///             name: "name",
    ///             tags: [
    ///                 "tags",
    ///                 "tags"
    ///             ]
    ///         ),
    ///         excludeUser: [
    ///             User(
    ///                 name: "name",
    ///                 tags: [
    ///                     "tags",
    ///                     "tags"
    ///                 ]
    ///             )
    ///         ],
    ///         filter: [
    ///             "filter"
    ///         ]
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getUsername(limit: Int, id: UUID, date: CalendarDate, deadline: Date, bytes: String, user: User, userList: [User], optionalDeadline: Date? = nil, keyValue: [String: String], optionalString: String? = nil, nestedUser: NestedUser, optionalUser: User? = nil, excludeUser: [User], filter: [String], requestOptions: RequestOptions? = nil) async throws -> User {
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
                "filter": .stringArray(filter)
            ],
            requestOptions: requestOptions,
            responseType: User.self
        )
    }
}