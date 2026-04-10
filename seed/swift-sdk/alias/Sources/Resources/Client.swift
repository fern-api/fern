import Foundation

public final class Client: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(typeId: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(typeId)",
            requestOptions: requestOptions
        )
    }
}