import Foundation

public enum TestCaseImplementationDescriptionBoardType: Codable, Hashable, Sendable {
    case html(String)
    case paramId(ParameterIdType)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "html":
            self = .html(try container.decode(String.self, forKey: .value))
        case "paramId":
            self = .paramId(try container.decode(ParameterIdType.self, forKey: .value))
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
        case .html(let data):
            try container.encode("html", forKey: .type)
            try container.encode(data, forKey: .value)
        case .paramId(let data):
            try container.encode("paramId", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}