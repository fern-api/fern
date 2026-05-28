import Foundation

public final class V1Client: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listUsers(requestOptions: RequestOptions? = nil) async throws -> [UserV1] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            requestOptions: requestOptions,
            responseType: [UserV1].self
        )
    }
}