import Foundation

public final class NestedNoAuthApiClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func nestedNoAuthApiGetSomething(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/nested-no-auth/get-something",
            requestOptions: requestOptions
        )
    }
}