public final class LiteralClient: Sendable {
    public let headers: HeadersClient
    public let inlined: InlinedClient
    public let path: PathClient
    public let query: QueryClient
    public let reference: ReferenceClient
    private let config: ClientConfig
}