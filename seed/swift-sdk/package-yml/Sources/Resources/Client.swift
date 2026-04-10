import Foundation

public final class Client: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func echo(id: String, request: Requests.EchoRequest, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/\(id)",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}