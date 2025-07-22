public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createUser(request: Any, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .post,
            path: "/user",
            body: request,
            requestOptions: requestOptions,
            responseType: User.self
        )
    }
}