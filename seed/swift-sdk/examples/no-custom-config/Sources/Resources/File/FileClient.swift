import Foundation

public final class FileClient: Sendable {
    public let notification: NotificationClient
    public let service: FileServiceClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.notification = NotificationClient(config: config)
        self.service = FileServiceClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}