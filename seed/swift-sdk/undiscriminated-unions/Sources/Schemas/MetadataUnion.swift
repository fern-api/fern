public enum MetadataUnion: Codable, Hashable, Sendable {
    case optionalMetadata(OptionalMetadata)
    case namedMetadata(NamedMetadata)

    public init() throws {
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .optionalMetadata(let value):
            try container.encode(value)
        case .namedMetadata(let value):
            try container.encode(value)
        }
    }
}