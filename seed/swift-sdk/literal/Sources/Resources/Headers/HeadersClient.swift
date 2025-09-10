import Foundation

public final class HeadersClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(request: Requests.SendLiteralsInHeadersRequest, requestOptions: RequestOptions? = nil) async throws -> SendResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/headers",
            body: request,
            requestOptions: requestOptions,
            responseType: SendResponse.self
        )
    }
}