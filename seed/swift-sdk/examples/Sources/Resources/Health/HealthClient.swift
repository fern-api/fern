import Foundation

public final class HealthClient: Sendable {
    public let service: HealthServiceClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.service = HealthServiceClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}