import Foundation

public final class FileClient: Sendable {
    public let directory: DirectoryClient
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.directory = DirectoryClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}