import Foundation

public final class FolderAClient: Sendable {
    public let service: ServiceClient
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.service = ServiceClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}