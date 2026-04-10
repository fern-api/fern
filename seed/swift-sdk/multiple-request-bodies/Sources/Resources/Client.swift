import Foundation

public final class Client: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func uploadJsonDocument(request: Requests.UploadJsonDocumentRequest, requestOptions: RequestOptions? = nil) async throws -> UploadDocumentResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/documents/upload/json",
            body: request,
            requestOptions: requestOptions,
            responseType: UploadDocumentResponse.self
        )
    }

    public func uploadPdfDocument(request: Data, requestOptions: RequestOptions? = nil) async throws -> UploadDocumentResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/documents/upload/pdf",
            contentType: .applicationOctetStream,
            body: request,
            requestOptions: requestOptions,
            responseType: UploadDocumentResponse.self
        )
    }
}