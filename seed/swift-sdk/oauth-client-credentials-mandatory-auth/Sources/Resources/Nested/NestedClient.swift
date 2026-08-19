import Foundation

public final class NestedClient: Sendable {
    public let api: ApiClient
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.api = ApiClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}