import Foundation

public final class PutClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func add(id: String, requestOptions: RequestOptions? = nil) async throws -> PutResponse {
        return try await httpClient.performRequest(
            method: .put,
            path: "/\(id)",
            requestOptions: requestOptions,
            responseType: PutResponse.self
        )
    }
}