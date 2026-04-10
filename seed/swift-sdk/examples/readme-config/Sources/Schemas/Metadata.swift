import Foundation

public enum Metadata: Codable, Hashable, Sendable {
    case html(MetadataHtml)
    case markdown(MetadataMarkdown)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "html":
            self = .html(try MetadataHtml(from: decoder))
        case "markdown":
            self = .markdown(try MetadataMarkdown(from: decoder))
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
            try data.encode(to: encoder)
        case .markdown(let data):
            try container.encode("markdown", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}