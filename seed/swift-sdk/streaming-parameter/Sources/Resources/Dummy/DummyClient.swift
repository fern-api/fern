import Foundation

public final class DummyClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func generate(request: GenerateRequest, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post,
            path: "/generate",
            body: request,
            requestOptions: requestOptions,
            responseType: Any.self
        )
    }
}