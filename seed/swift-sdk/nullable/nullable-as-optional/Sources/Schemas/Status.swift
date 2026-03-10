import Foundation

public enum Status: Codable, Hashable, Sendable {
    case active
    case archived(Nullable<Date>)
    case softDeleted(Date?)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "active":
            self = .active
        case "archived":
            self = .archived(try container.decode(Nullable<Date>.self, forKey: .value))
        case "soft-deleted":
            self = .softDeleted(try container.decode(Date?.self, forKey: .value))
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
        case .active:
            try container.encode("active", forKey: .type)
        case .archived(let data):
            try container.encode("archived", forKey: .type)
            try container.encode(data, forKey: .value)
        case .softDeleted(let data):
            try container.encode("soft-deleted", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}