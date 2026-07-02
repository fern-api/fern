import Foundation

public final class ReportingClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func load(request: Requests.LoadRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/load",
            body: request,
            requestOptions: requestOptions
        )
    }
}