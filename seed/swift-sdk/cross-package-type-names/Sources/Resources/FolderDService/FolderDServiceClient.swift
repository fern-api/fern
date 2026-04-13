import Foundation

public final class FolderDServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func folderDServiceGetDirectThread(requestOptions: RequestOptions? = nil) async throws -> FolderDResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/folder-d",
            requestOptions: requestOptions,
            responseType: FolderDResponse.self
        )
    }
}