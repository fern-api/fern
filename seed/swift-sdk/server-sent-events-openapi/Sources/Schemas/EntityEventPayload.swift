import Foundation

public struct EntityEventPayload: Codable, Hashable, Sendable {
    public let entityId: String?
    public let eventType: EntityEventPayloadEventType?
    public let updatedTime: Date?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        entityId: String? = nil,
        eventType: EntityEventPayloadEventType? = nil,
        updatedTime: Date? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.entityId = entityId
        self.eventType = eventType
        self.updatedTime = updatedTime
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.entityId = try container.decodeIfPresent(String.self, forKey: .entityId)
        self.eventType = try container.decodeIfPresent(EntityEventPayloadEventType.self, forKey: .eventType)
        self.updatedTime = try container.decodeIfPresent(Date.self, forKey: .updatedTime)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.entityId, forKey: .entityId)
        try container.encodeIfPresent(self.eventType, forKey: .eventType)
        try container.encodeIfPresent(self.updatedTime, forKey: .updatedTime)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case entityId
        case eventType
        case updatedTime
    }
}