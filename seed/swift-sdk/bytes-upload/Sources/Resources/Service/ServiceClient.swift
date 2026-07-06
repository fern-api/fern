import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import BytesUpload
    ///
    /// private func main() async throws {
    ///     let client = BytesUploadClient()
    ///
    ///     _ = try await client.service.upload(request: Data("data".utf8))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func upload(request: Data, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/upload-content",
            contentType: .applicationOctetStream,
            body: request,
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import BytesUpload
    ///
    /// private func main() async throws {
    ///     let client = BytesUploadClient()
    ///
    ///     _ = try await client.service.uploadWithQueryParams(
    ///         model: "nova-2",
    ///         request: Data("data".utf8)
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter model: The model to use for processing
    /// - Parameter language: The language of the content
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func uploadWithQueryParams(model: String, language: String? = nil, request: Data, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/upload-content-with-query-params",
            contentType: .applicationOctetStream,
            queryParams: [
                "model": .string(model), 
                "language": language.map { .string($0) }
            ],
            body: request,
            requestOptions: requestOptions
        )
    }
}