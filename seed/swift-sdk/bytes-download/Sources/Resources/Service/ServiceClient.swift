import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func download(id: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get,
            path: "/download-content/\(id)",
            requestOptions: requestOptions,
            responseType: Any.self
        )
    }
}