import Foundation

public enum Exception: Codable, Hashable, Sendable {
    case generic(ExceptionInfo)
    case timeout

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "generic":
            self = .generic(try ExceptionInfo(from: decoder))
        case "timeout":
            self = .timeout
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
        case .generic(let data):
            try container.encode("generic", forKey: .type)
            try data.encode(to: encoder)
        case .timeout:
            try container.encode("timeout", forKey: .type)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}