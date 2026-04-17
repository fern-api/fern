import Foundation

/// Tests that dynamic snippets include all required properties even when
/// the example data only provides a subset. In C#, properties marked as
/// `required` must be set in the object initializer.
public struct ObjectWithMixedRequiredAndOptionalFields: Codable, Hashable, Sendable {
    public let requiredString: String
    public let requiredInteger: Int
    public let optionalString: String?
    public let requiredLong: Int64
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        requiredString: String,
        requiredInteger: Int,
        optionalString: String? = nil,
        requiredLong: Int64,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.requiredString = requiredString
        self.requiredInteger = requiredInteger
        self.optionalString = optionalString
        self.requiredLong = requiredLong
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.requiredString = try container.decode(String.self, forKey: .requiredString)
        self.requiredInteger = try container.decode(Int.self, forKey: .requiredInteger)
        self.optionalString = try container.decodeIfPresent(String.self, forKey: .optionalString)
        self.requiredLong = try container.decode(Int64.self, forKey: .requiredLong)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.requiredString, forKey: .requiredString)
        try container.encode(self.requiredInteger, forKey: .requiredInteger)
        try container.encodeIfPresent(self.optionalString, forKey: .optionalString)
        try container.encode(self.requiredLong, forKey: .requiredLong)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case requiredString
        case requiredInteger
        case optionalString
        case requiredLong
    }
}