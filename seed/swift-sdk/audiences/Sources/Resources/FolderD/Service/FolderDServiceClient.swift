import Foundation

public final class FolderDServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getDirectThread(requestOptions: RequestOptions? = nil) async throws -> ResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/partner-path",
            requestOptions: requestOptions,
            responseType: ResponseType.self
        )
    }
}