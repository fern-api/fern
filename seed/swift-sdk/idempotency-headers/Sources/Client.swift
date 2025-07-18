public final class IdempotencyHeadersClient: Sendable {
    public let payment: PaymentClient
    private let config: ClientConfig
}