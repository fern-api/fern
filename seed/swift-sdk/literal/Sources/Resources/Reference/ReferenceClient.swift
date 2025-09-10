import Foundation

public final class ReferenceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func send(request: SendRequest, requestOptions: RequestOptions? = nil) async throws -> SendResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/reference",
            body: request,
            requestOptions: requestOptions,
            responseType: SendResponse.self
        )
    }
}