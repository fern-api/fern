import Foundation

/// Undiscriminated union for testing
public enum SearchResult: Codable, Hashable, Sendable {
    case document(Document)
    case organization(Organization)
    case user(UserResponse)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "document":
            self = .document(try Document(from: decoder))
        case "organization":
            self = .organization(try Organization(from: decoder))
        case "user":
            self = .user(try UserResponse(from: decoder))
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
        case .document(let data):
            try container.encode("document", forKey: .type)
            try data.encode(to: encoder)
        case .organization(let data):
            try container.encode("organization", forKey: .type)
            try data.encode(to: encoder)
        case .user(let data):
            try container.encode("user", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}