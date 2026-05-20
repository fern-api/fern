import Foundation

public final class StatusClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getStatus(requestOptions: RequestOptions? = nil) async throws -> StatusResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/status",
            requestOptions: requestOptions,
            responseType: StatusResponse.self
        )
    }
}