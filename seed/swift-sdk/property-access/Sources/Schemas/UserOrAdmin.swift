import Foundation

/// Example of an undiscriminated union
public enum UserOrAdmin: Codable, Hashable, Sendable {
    case admin(Admin)
    case user(User)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Admin.self) {
            self = .admin(value)
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
        case .admin(let value):
            try container.encode(value)
        case .user(let value):
            try container.encode(value)
        }
    }
}