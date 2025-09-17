import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
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
}