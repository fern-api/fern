import Foundation

public final class InlinedRequestClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(request: Requests.SendEnumInlinedRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inlined",
            body: request,
            requestOptions: requestOptions
        )
    }
}