import Foundation

/// Tests that union members named 'Type' or 'Value' don't collide with internal properties
public enum UnionWithReservedNames: Codable, Hashable, Sendable {
    case string(String)
    case unionWithReservedNamesOne(UnionWithReservedNamesOne)
    case unionWithReservedNamesZero(UnionWithReservedNamesZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode(UnionWithReservedNamesOne.self) {
            self = .unionWithReservedNamesOne(value)
        } else if let value = try? container.decode(UnionWithReservedNamesZero.self) {
            self = .unionWithReservedNamesZero(value)
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
        case .unionWithReservedNamesOne(let value):
            try container.encode(value)
        case .unionWithReservedNamesZero(let value):
            try container.encode(value)
        }
    }
}