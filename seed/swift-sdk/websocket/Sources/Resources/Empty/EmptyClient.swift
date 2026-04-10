import Foundation

public final class EmptyClient: Sendable {
    public let emptyRealtime: EmptyRealtimeClient
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.emptyRealtime = EmptyRealtimeClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}