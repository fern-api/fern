import Foundation

/// Union with multiple named type aliases that all resolve to the same C# type (string).
/// Without the fix, this would generate duplicate implicit operators:
///   public static implicit operator UnionWithTypeAliases(string value) => ...
///   public static implicit operator UnionWithTypeAliases(string value) => ...
///   public static implicit operator UnionWithTypeAliases(string value) => ...
/// causing CS0557 compiler error.
public enum UnionWithTypeAliases: Codable, Hashable, Sendable {
    case name(Name)
    case string(String)
    case userId(UserId)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Name.self) {
            self = .name(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode(UserId.self) {
            self = .userId(value)
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
        case .name(let value):
            try container.encode(value)
        case .string(let value):
            try container.encode(value)
        case .userId(let value):
            try container.encode(value)
        }
    }
}