import Foundation

public struct Link: Codable, Hashable, Sendable {
    public let rel: String
    public let method: String
    public let href: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        rel: String,
        method: String,
        href: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.rel = rel
        self.method = method
        self.href = href
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.rel = try container.decode(String.self, forKey: .rel)
        self.method = try container.decode(String.self, forKey: .method)
        self.href = try container.decode(String.self, forKey: .href)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.rel, forKey: .rel)
        try container.encode(self.method, forKey: .method)
        try container.encode(self.href, forKey: .href)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case rel
        case method
        case href
    }
}