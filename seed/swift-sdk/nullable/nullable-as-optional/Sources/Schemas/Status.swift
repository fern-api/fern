import Foundation

public enum Status: Codable, Hashable, Sendable {
    case active(StatusActive)
    case archived(StatusArchived)
    case softDeleted(StatusSoftDeleted)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "active":
            self = .active(try StatusActive(from: decoder))
        case "archived":
            self = .archived(try StatusArchived(from: decoder))
        case "soft-deleted":
            self = .softDeleted(try StatusSoftDeleted(from: decoder))
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
        case .active(let data):
            try container.encode("active", forKey: .type)
            try data.encode(to: encoder)
        case .archived(let data):
            try container.encode("archived", forKey: .type)
            try data.encode(to: encoder)
        case .softDeleted(let data):
            try container.encode("soft-deleted", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}