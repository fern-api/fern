import Foundation

public struct StreamEventContextProtocolZero: Codable, Hashable, Sendable {
    public let content: String
    public let event: StreamEventContextProtocolZeroEvent
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        content: String,
        event: StreamEventContextProtocolZeroEvent,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.content = content
        self.event = event
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.content = try container.decode(String.self, forKey: .content)
        self.event = try container.decode(StreamEventContextProtocolZeroEvent.self, forKey: .event)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.content, forKey: .content)
        try container.encode(self.event, forKey: .event)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case content
        case event
    }
}