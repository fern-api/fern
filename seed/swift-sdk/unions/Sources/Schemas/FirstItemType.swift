import Foundation

public struct FirstItemType: Codable, Hashable, Sendable {
    public let type: Nullable<FirstItemTypeType>?
    public let name: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        type: Nullable<FirstItemTypeType>? = nil,
        name: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.type = type
        self.name = name
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decodeNullableIfPresent(FirstItemTypeType.self, forKey: .type)
        self.name = try container.decode(String.self, forKey: .name)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeNullableIfPresent(self.type, forKey: .type)
        try container.encode(self.name, forKey: .name)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case name
    }
}