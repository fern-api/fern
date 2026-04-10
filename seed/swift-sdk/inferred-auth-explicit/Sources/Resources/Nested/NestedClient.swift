import Foundation

public final class NestedClient: Sendable {
    public let api: NestedApiClient
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.api = NestedApiClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}