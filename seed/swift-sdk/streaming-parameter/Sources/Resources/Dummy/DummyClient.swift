import Foundation

public final class DummyClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func generate(request: Requests.GenerateRequest, requestOptions: RequestOptions? = nil) async throws -> RegularResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/generate",
            body: request,
            requestOptions: requestOptions,
            responseType: RegularResponse.self
        )
    }
}