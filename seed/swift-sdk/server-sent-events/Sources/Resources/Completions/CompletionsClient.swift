import Foundation

public final class CompletionsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func stream(request: Requests.CompletionsStreamRequest, requestOptions: RequestOptions? = nil) async throws -> Data {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream",
            body: request,
            requestOptions: requestOptions,
            responseType: Data.self
        )
    }

    public func streamwithoutterminator(request: Requests.CompletionsStreamWithoutTerminatorRequest, requestOptions: RequestOptions? = nil) async throws -> Data {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream-no-terminator",
            body: request,
            requestOptions: requestOptions,
            responseType: Data.self
        )
    }
}