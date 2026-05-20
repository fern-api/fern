import Foundation

public final class WidgetsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func create(apiVersion: String, request: Widget, requestOptions: RequestOptions? = nil) async throws -> Widget {
        return try await httpClient.performRequest(
            method: .post,
            path: "/\(apiVersion)/widgets",
            body: request,
            requestOptions: requestOptions,
            responseType: Widget.self
        )
    }
}