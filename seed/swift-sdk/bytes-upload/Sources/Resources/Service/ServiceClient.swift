import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func upload(request: Data, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/upload-content",
            contentType: .applicationOctetStream,
            body: request,
            requestOptions: requestOptions
        )
    }

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