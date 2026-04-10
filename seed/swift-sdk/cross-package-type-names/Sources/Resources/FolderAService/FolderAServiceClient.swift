import Foundation

public final class FolderAServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func folderAServiceGetDirectThread(requestOptions: RequestOptions? = nil) async throws -> FolderAResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/folder-a",
            requestOptions: requestOptions,
            responseType: FolderAResponse.self
        )
    }
}