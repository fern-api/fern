import Foundation

public final class CallsClient: Sendable {
    public let calls: CallsCallsClient
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.calls = CallsCallsClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}