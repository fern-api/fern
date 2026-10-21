import Foundation

public enum UnionWithGlobalNameCollisions: Codable, Hashable, Sendable {
    case aim(String)
    case date(String)
    case error(String)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "Aim":
            self = .aim(try container.decode(String.self, forKey: .value))
        case "Date":
            self = .date(try container.decode(String.self, forKey: .value))
        case "Error":
            self = .error(try container.decode(String.self, forKey: .value))
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
        case .aim(let data):
            try container.encode("Aim", forKey: .type)
            try container.encode(data, forKey: .value)
        case .date(let data):
            try container.encode("Date", forKey: .type)
            try container.encode(data, forKey: .value)
        case .error(let data):
            try container.encode("Error", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}