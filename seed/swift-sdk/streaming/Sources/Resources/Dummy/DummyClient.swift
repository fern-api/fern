import Foundation

public final class DummyClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func generateStream(request: Requests.DummyGenerateStreamRequest, requestOptions: RequestOptions? = nil) async throws -> Data {
        return try await httpClient.performRequest(
            method: .post,
            path: "/generate-stream",
            body: request,
            requestOptions: requestOptions,
            responseType: Data.self
        )
    }

    public func generate(request: Requests.DummyGenerateRequest, requestOptions: RequestOptions? = nil) async throws -> StreamResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/generate",
            body: request,
            requestOptions: requestOptions,
            responseType: StreamResponse.self
        )
    }
}