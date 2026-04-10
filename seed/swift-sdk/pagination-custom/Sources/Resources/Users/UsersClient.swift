import Foundation

public final class UsersClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listwithcustompager(limit: Nullable<Int>? = nil, startingAfter: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> UsersListResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "limit": limit?.wrappedValue.map { .int($0) }, 
                "starting_after": startingAfter?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: UsersListResponse.self
        )
    }
}