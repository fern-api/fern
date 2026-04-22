import Foundation

public enum ActualResult: Codable, Hashable, Sendable {
    case exception(ExceptionInfo)
    case exceptionV2(ExceptionV2)
    case value(VariableValue)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "exception":
            self = .exception(try ExceptionInfo(from: decoder))
        case "exceptionV2":
            self = .exceptionV2(try container.decode(ExceptionV2.self, forKey: .value))
        case "value":
            self = .value(try container.decode(VariableValue.self, forKey: .value))
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
        case .exception(let data):
            try container.encode("exception", forKey: .type)
            try data.encode(to: encoder)
        case .exceptionV2(let data):
            try container.encode("exceptionV2", forKey: .type)
            try container.encode(data, forKey: .value)
        case .value(let data):
            try container.encode("value", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}