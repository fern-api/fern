import Foundation

public enum SipHeaderAction: Codable, Hashable, Sendable {
    case dynamic(CustomSipHeader)
    case `static`(CustomSipHeader)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "dynamic":
            self = .dynamic(try CustomSipHeader(from: decoder))
        case "static":
            self = .static(try CustomSipHeader(from: decoder))
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
        case .dynamic(let data):
            try container.encode("dynamic", forKey: .type)
            try data.encode(to: encoder)
        case .static(let data):
            try container.encode("static", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}