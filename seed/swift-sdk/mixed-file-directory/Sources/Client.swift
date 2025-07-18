public final class MixedFileDirectoryClient: Sendable {
    public let organization: OrganizationClient
    public let user: UserClient
    private let config: ClientConfig
}