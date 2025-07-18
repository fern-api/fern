public final class UnionsClient: Sendable {
    public let bigunion: BigunionClient
    public let types: TypesClient
    public let union: UnionClient
    private let config: ClientConfig
}