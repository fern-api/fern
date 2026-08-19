import Foundation

public enum CustomFiles: Codable, Hashable, Sendable {
    case basic(BasicCustomFiles)
    case custom([Language: Files])

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "basic":
            self = .basic(try BasicCustomFiles(from: decoder))
        case "custom":
            self = .custom(try container.decode([Language: Files].self, forKey: .value))
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
        case .basic(let data):
            try container.encode("basic", forKey: .type)
            try data.encode(to: encoder)
        case .custom(let data):
            try container.encode("custom", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}