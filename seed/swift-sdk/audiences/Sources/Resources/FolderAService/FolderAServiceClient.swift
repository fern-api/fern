import Foundation

public final class FolderAServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func folderAServiceGetDirectThread(ids: String? = nil, tags: String? = nil, requestOptions: RequestOptions? = nil) async throws -> FolderAResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/",
            queryParams: [
                "ids": ids.map { .string($0) }, 
                "tags": tags.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: FolderAResponse.self
        )
    }
}