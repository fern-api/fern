import Foundation

/// An object where each property contains embedding arrays.
/// Similar to schemas that define both object properties and array items.
public struct EmbeddingsByModel: Codable, Hashable, Sendable {
    public let float: [[Double]]?
    public let int8: [[Int]]?
    public let uint8: [[Int]]?
    public let base64: [String]?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        float: [[Double]]? = nil,
        int8: [[Int]]? = nil,
        uint8: [[Int]]? = nil,
        base64: [String]? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.float = float
        self.int8 = int8
        self.uint8 = uint8
        self.base64 = base64
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.float = try container.decodeIfPresent([[Double]].self, forKey: .float)
        self.int8 = try container.decodeIfPresent([[Int]].self, forKey: .int8)
        self.uint8 = try container.decodeIfPresent([[Int]].self, forKey: .uint8)
        self.base64 = try container.decodeIfPresent([String].self, forKey: .base64)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.float, forKey: .float)
        try container.encodeIfPresent(self.int8, forKey: .int8)
        try container.encodeIfPresent(self.uint8, forKey: .uint8)
        try container.encodeIfPresent(self.base64, forKey: .base64)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case float
        case int8
        case uint8
        case base64
    }
}