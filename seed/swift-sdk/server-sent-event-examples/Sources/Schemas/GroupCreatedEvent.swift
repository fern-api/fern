import Foundation

public struct GroupCreatedEvent: Codable, Hashable, Sendable {
    public let offset: String
    public let groupId: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        offset: String,
        groupId: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.offset = offset
        self.groupId = groupId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.offset = try container.decode(String.self, forKey: .offset)
        self.groupId = try container.decode(String.self, forKey: .groupId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.offset, forKey: .offset)
        try container.encode(self.groupId, forKey: .groupId)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case offset
        case groupId = "group_id"
    }
}