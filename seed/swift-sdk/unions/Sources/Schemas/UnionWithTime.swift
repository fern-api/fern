import Foundation

public enum UnionWithTime: Codable, Hashable, Sendable {
    case date(UnionWithTimeDate)
    case datetime(UnionWithTimeDatetime)
    case value(UnionWithTimeValue)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "date":
            self = .date(try UnionWithTimeDate(from: decoder))
        case "datetime":
            self = .datetime(try UnionWithTimeDatetime(from: decoder))
        case "value":
            self = .value(try UnionWithTimeValue(from: decoder))
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
            try data.encode(to: encoder)
        case .datetime(let data):
            try container.encode("datetime", forKey: .type)
            try data.encode(to: encoder)
        case .value(let data):
            try container.encode("value", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}