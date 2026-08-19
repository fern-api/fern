import Foundation

/// Example of an discriminated union
public enum UserOrAdminDiscriminated: Codable, Hashable, Sendable {
    case admin(Admin)
    case empty
    case user(User)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "admin":
            self = .admin(try container.decode(Admin.self, forKey: .admin))
        case "empty":
            self = .empty
        case "user":
            self = .user(try User(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .admin(let data):
            try container.encode("admin", forKey: .type)
            try container.encode(data, forKey: .admin)
        case .empty:
            try container.encode("empty", forKey: .type)
        case .user(let data):
            try container.encode("user", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case admin
    }
}