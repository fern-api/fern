import Foundation

/// Outer union where one variant is an object containing a nested union field.
/// Tests that the deserializer correctly handles transitive union deserialization.
public enum OuterNestedUnion: Codable, Hashable, Sendable {
    case string(String)
    case wrapperObject(WrapperObject)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode(WrapperObject.self) {
            self = .wrapperObject(value)
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
        case .string(let value):
            try container.encode(value)
        case .wrapperObject(let value):
            try container.encode(value)
        }
    }
}