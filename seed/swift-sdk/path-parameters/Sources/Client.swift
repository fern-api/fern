public final class PathParametersClient: Sendable {
    public let organizations: OrganizationsClient
    public let user: UserClient
    private let config: ClientConfig
}