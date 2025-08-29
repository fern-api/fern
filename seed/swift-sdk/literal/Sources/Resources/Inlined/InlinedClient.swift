import Foundation

public final class InlinedClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(request: Requests.SendLiteralsInlinedRequest, requestOptions: RequestOptions? = nil) async throws -> SendResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inlined",
            body: request,
            requestOptions: requestOptions,
            responseType: SendResponse.self
        )
    }
}