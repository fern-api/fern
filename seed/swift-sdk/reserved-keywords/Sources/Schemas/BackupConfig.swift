import Foundation

public enum BackupConfig: Codable, Hashable, Sendable {
    case fallback(BackupOverride)
    case override(BackupOverride)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "fallback":
            self = .fallback(try BackupOverride(from: decoder))
        case "override":
            self = .override(try BackupOverride(from: decoder))
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
        case .fallback(let data):
            try container.encode("fallback", forKey: .type)
            try data.encode(to: encoder)
        case .override(let data):
            try container.encode("override", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}