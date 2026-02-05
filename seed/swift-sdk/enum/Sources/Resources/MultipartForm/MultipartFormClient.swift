import Foundation

public final class MultipartFormClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func multipartForm(request: Requests.MultipartFormRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/multipart",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions
        )
    }
}