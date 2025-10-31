import Foundation

/// Response for deserialization test
public struct DeserializationTestResponse: Codable, Hashable, Sendable {
    public let echo: DeserializationTestRequest
    public let processedAt: Date
    public let nullCount: Int
    public let presentFieldsCount: Int
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        echo: DeserializationTestRequest,
        processedAt: Date,
        nullCount: Int,
        presentFieldsCount: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.echo = echo
        self.processedAt = processedAt
        self.nullCount = nullCount
        self.presentFieldsCount = presentFieldsCount
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.echo = try container.decode(DeserializationTestRequest.self, forKey: .echo)
        self.processedAt = try container.decode(Date.self, forKey: .processedAt)
        self.nullCount = try container.decode(Int.self, forKey: .nullCount)
        self.presentFieldsCount = try container.decode(Int.self, forKey: .presentFieldsCount)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.echo, forKey: .echo)
        try container.encode(self.processedAt, forKey: .processedAt)
        try container.encode(self.nullCount, forKey: .nullCount)
        try container.encode(self.presentFieldsCount, forKey: .presentFieldsCount)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case echo
        case processedAt
        case nullCount
        case presentFieldsCount
    }
}