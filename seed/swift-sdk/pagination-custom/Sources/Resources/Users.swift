public final class UsersClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listUsernamesCustom(startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> UsernameCursor {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: UsernameCursor.self
        )
    }
}