import Foundation

public enum UnionWithOptionalTime: Codable, Hashable, Sendable {
    case date(CalendarDate?)
    case datetime(Date?)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "date":
            self = .date(try container.decode(CalendarDate?.self, forKey: .value))
        case "datetime":
            self = .datetime(try container.decode(Date?.self, forKey: .value))
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
        case .date(let data):
            try container.encode("date", forKey: .type)
            try container.encode(data, forKey: .value)
        case .datetime(let data):
            try container.encode("datetime", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}