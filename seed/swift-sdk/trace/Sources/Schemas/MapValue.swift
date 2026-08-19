import Foundation

public struct MapValue: Codable, Hashable, Sendable {
    public let keyValuePairs: [KeyValuePair]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        keyValuePairs: [KeyValuePair],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.keyValuePairs = keyValuePairs
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.keyValuePairs = try container.decode([KeyValuePair].self, forKey: .keyValuePairs)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.keyValuePairs, forKey: .keyValuePairs)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case keyValuePairs
    }
}