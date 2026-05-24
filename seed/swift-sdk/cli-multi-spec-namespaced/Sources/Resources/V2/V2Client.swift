import Foundation

public final class V2Client: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listUsers(pageSize: Int? = nil, requestOptions: RequestOptions? = nil) async throws -> [UserV2] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "pageSize": pageSize.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: [UserV2].self
        )
    }
}