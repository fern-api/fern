public final class AnyAuthClient: Sendable {
    public let auth: AuthClient
    public let user: UserClient
    private let config: ClientConfig
}