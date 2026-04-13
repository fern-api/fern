import Foundation

public final class FolderServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func folderServiceEndpoint(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/service",
            requestOptions: requestOptions
        )
    }

    public func folderServiceUnknownRequest(request: JSONValue, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/service",
            body: request,
            requestOptions: requestOptions
        )
    }
}