import Foundation

public struct OutboundCallConversationsResponse: Codable, Hashable, Sendable {
    /// Always null when dry_run is true.
    public let conversationId: Nullable<JSONValue>
    /// Always true for this response.
    public let dryRun: JSONValue
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        conversationId: Nullable<JSONValue>,
        dryRun: JSONValue,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.conversationId = conversationId
        self.dryRun = dryRun
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.conversationId = try container.decode(Nullable<JSONValue>.self, forKey: .conversationId)
        self.dryRun = try container.decode(JSONValue.self, forKey: .dryRun)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.conversationId, forKey: .conversationId)
        try container.encode(self.dryRun, forKey: .dryRun)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case conversationId = "conversation_id"
        case dryRun = "dry_run"
    }
}