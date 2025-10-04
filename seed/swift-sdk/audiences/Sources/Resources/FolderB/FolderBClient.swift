import Foundation

public final class FolderBClient: Sendable {
    public let common: CommonClient
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.common = CommonClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}