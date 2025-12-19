import Foundation

/// A standard object with no nullable issues.
public struct NormalObject: Codable, Hashable, Sendable {
    public let normalField: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        normalField: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.normalField = normalField
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.normalField = try container.decodeIfPresent(String.self, forKey: .normalField)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.normalField, forKey: .normalField)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case normalField
    }
}