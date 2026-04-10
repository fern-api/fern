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

    public func streamevents(request: Requests.CompletionsStreamEventsRequest, requestOptions: RequestOptions? = nil) async throws -> Data {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream-events",
            body: request,
            requestOptions: requestOptions,
            responseType: Data.self
        )
    }

    public func streameventscontextprotocol(request: Requests.CompletionsStreamEventsContextProtocolRequest, requestOptions: RequestOptions? = nil) async throws -> Data {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream-events-context-protocol",
            body: request,
            requestOptions: requestOptions,
            responseType: Data.self
        )
    }
}