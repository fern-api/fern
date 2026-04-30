import Foundation

/// Inner union with two object variants that have disjoint required keys.
/// Tests that required-key guards work correctly inside nested union contexts.
public enum NestedObjectUnion: Codable, Hashable, Sendable {
    case leafTypeA(LeafTypeA)
    case leafTypeB(LeafTypeB)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(LeafTypeA.self) {
            self = .leafTypeA(value)
        } else if let value = try? container.decode(LeafTypeB.self) {
            self = .leafTypeB(value)
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
        case .leafTypeA(let value):
            try container.encode(value)
        case .leafTypeB(let value):
            try container.encode(value)
        }
    }
}