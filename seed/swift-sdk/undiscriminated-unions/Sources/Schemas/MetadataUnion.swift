import Foundation

public enum MetadataUnion: Codable, Hashable, Sendable {
    case optionalMetadata(OptionalMetadata)
    case namedMetadata(NamedMetadata)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(OptionalMetadata.self) {
            self = .optionalMetadata(value)
        } else if let value = try? container.decode(NamedMetadata.self) {
            self = .namedMetadata(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
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