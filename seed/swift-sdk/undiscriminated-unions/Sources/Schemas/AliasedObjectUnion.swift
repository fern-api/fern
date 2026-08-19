import Foundation

/// Undiscriminated union whose members are named aliases of object types
/// (including an alias-of-alias). Required keys are disjoint, so a correct
/// deserializer must emit containsKey() guards for each alias variant.
public enum AliasedObjectUnion: Codable, Hashable, Sendable {
    case aliasedLeafA(AliasedLeafA)
    case aliasedLeafB(AliasedLeafB)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(AliasedLeafA.self) {
            self = .aliasedLeafA(value)
        } else if let value = try? container.decode(AliasedLeafB.self) {
            self = .aliasedLeafB(value)
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
        case .aliasedLeafA(let value):
            try container.encode(value)
        case .aliasedLeafB(let value):
            try container.encode(value)
        }
    }
}