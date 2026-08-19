import Foundation

public struct SendEvent: Codable, Hashable, Sendable {
    public let text: String
    public let priority: Int
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        text: String,
        priority: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.text = text
        self.priority = priority
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.text = try container.decode(String.self, forKey: .text)
        self.priority = try container.decode(Int.self, forKey: .priority)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.text, forKey: .text)
        try container.encode(self.priority, forKey: .priority)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case text
        case priority
    }
}