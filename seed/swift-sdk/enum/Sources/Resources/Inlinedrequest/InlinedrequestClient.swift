import Foundation

public final class InlinedrequestClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(request: Requests.InlinedRequestSendRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inlined",
            body: request,
            requestOptions: requestOptions
        )
    }
}