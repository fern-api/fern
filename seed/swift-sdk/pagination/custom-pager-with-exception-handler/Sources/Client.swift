public final class PaginationClient: Sendable {
    public let complex: ComplexClient
    public let users: UsersClient
    private let config: ClientConfig
}