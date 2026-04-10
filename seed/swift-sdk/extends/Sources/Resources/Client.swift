import Foundation

public final class Client: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func extendedInlineRequestBody(request: Requests.ExtendedInlineRequestBodyRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/extends/extended-inline-request-body",
            body: request,
            requestOptions: requestOptions
        )
    }
}