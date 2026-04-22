import Foundation

public final class FileUploadExampleClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Upload a file to the database
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func uploadFile(request: Requests.UploadFileRequest, requestOptions: RequestOptions? = nil) async throws -> FileId {
        return try await httpClient.performRequest(
            method: .post,
            path: "/upload-file",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions,
            responseType: FileId.self
        )
    }
}