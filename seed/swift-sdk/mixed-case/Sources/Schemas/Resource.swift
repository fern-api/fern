import Foundation

public enum Resource: Codable, Hashable, Sendable {
    case organization(Organization)
    case user(User)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .resourceType)
        switch discriminant {
        case "Organization":
            self = .organization(try Organization(from: decoder))
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
        case .organization(let data):
            try container.encode("Organization", forKey: .resourceType)
            try data.encode(to: encoder)
        case .user(let data):
            try container.encode("user", forKey: .resourceType)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case resourceType = "resource_type"
    }
}