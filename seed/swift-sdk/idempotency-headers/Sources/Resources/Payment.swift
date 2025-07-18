public final class PaymentClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func create(requestOptions: RequestOptions? = nil) async throws -> UUID {
    }

    public func delete(requestOptions: RequestOptions? = nil) async throws -> Any {
    }
}