import Foundation

public struct CommonsEventInfoZero: Codable, Hashable, Sendable {
    public let id: String
    public let data: Nullable<[String: Nullable<String>]>?
    public let jsonString: Nullable<String>?
    public let type: CommonsEventInfoZeroType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        data: Nullable<[String: Nullable<String>]>? = nil,
        jsonString: Nullable<String>? = nil,
        type: CommonsEventInfoZeroType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.data = data
        self.jsonString = jsonString
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.data = try container.decodeNullableIfPresent([String: Nullable<String>].self, forKey: .data)
        self.jsonString = try container.decodeNullableIfPresent(String.self, forKey: .jsonString)
        self.type = try container.decode(CommonsEventInfoZeroType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encodeNullableIfPresent(self.data, forKey: .data)
        try container.encodeNullableIfPresent(self.jsonString, forKey: .jsonString)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case data
        case jsonString
        case type
    }
}