import Foundation

public final class DummyClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func generateStream(request: GenerateStreamRequest, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post,
            path: "/generate-stream",
            body: request,
            requestOptions: requestOptions,
            responseType: Any.self
        )
    }

    public func generate(request: Generateequest, requestOptions: RequestOptions? = nil) async throws -> StreamResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/generate",
            body: request,
            requestOptions: requestOptions,
            responseType: StreamResponse.self
        )
    }
}