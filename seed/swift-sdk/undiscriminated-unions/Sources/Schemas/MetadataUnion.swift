public enum MetadataUnion: Codable, Hashable, Sendable {
    case optionalMetadata(OptionalMetadata)
    case namedMetadata(NamedMetadata)

    public init() throws {
    }

    public func encode() throws -> Void {
    }
}