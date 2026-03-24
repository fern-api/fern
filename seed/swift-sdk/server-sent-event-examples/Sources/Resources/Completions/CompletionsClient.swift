import Foundation

public final class CompletionsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func stream(request: Requests.StreamCompletionRequest, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }

    public func streamEvents(request: Requests.StreamEventsRequest, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream-events",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }

    public func streamEventsContextProtocol(request: Requests.StreamEventsContextProtocolRequest, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream-events-context-protocol",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }
}