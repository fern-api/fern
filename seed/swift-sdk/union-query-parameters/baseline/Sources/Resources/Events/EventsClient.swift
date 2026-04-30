import Foundation

public final class EventsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Subscribe to events with a oneOf-style query parameter that may be a
    /// scalar enum value or a list of enum values.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func subscribe(eventType: EventTypeParam? = nil, tags: StringOrListParam? = nil, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/events",
            queryParams: [
                "event_type": eventType.map { .unknown($0) }, 
                "tags": tags.map { .unknown($0) }
            ],
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}