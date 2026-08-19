import Foundation

public struct TypeWithOptionalMap: Codable, Hashable, Sendable {
    public let key: String
    public let columnValues: [String: String?]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        key: String,
        columnValues: [String: String?],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.key = key
        self.columnValues = columnValues
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.key = try container.decode(String.self, forKey: .key)
        self.columnValues = try container.decode([String: String?].self, forKey: .columnValues)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.key, forKey: .key)
        try container.encode(self.columnValues, forKey: .columnValues)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case key
        case columnValues
    }
}