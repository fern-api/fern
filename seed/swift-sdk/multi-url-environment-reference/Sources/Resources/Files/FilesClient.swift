import Foundation

public final class FilesClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Api
    /// 
    /// private func main() async throws {
    ///     let client = ApiClient(token: "<token>")
    /// 
    ///     _ = try await client.files.upload(request: .init(
    ///         name: "name",
    ///         parentId: "parent_id"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func upload(request: Requests.FilesUploadRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/files/content",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}