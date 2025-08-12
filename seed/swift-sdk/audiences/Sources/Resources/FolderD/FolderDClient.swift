import Foundation

public final class FolderDClient: Sendable {
    public let service: FolderDServiceClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.service = FolderDServiceClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}