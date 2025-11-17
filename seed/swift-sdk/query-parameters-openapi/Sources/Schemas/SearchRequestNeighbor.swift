import Foundation

public enum SearchRequestNeighbor: Codable, Hashable, Sendable {
    case int(Int)
    case nestedUser(NestedUser)
    case string(String)
    case user(User)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Int.self) {
            self = .int(value)
        } else if let value = try? container.decode(NestedUser.self) {
            self = .nestedUser(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode(User.self) {
            self = .user(value)
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
        case .int(let value):
            try container.encode(value)
        case .nestedUser(let value):
            try container.encode(value)
        case .string(let value):
            try container.encode(value)
        case .user(let value):
            try container.encode(value)
        }
    }
}