import Foundation

public final class FolderClient: Sendable {
    public let service: ServiceClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.service = ServiceClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }

    public func foo(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            requestOptions: requestOptions
        )
    }
}