import Foundation

/// Extends ObjectWithInheritedRequiredEnum, inheriting the required enum field.
/// This type should NOT derive Default in Rust because the parent type
/// has a required enum field.
public struct ExtendedObjectWithInheritedEnum: Codable, Hashable, Sendable {
    public let requiredEnum: WeatherReport
    public let requiredString: String
    public let optionalDescription: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        requiredEnum: WeatherReport,
        requiredString: String,
        optionalDescription: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.requiredEnum = requiredEnum
        self.requiredString = requiredString
        self.optionalDescription = optionalDescription
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.requiredEnum = try container.decode(WeatherReport.self, forKey: .requiredEnum)
        self.requiredString = try container.decode(String.self, forKey: .requiredString)
        self.optionalDescription = try container.decodeIfPresent(String.self, forKey: .optionalDescription)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.requiredEnum, forKey: .requiredEnum)
        try container.encode(self.requiredString, forKey: .requiredString)
        try container.encodeIfPresent(self.optionalDescription, forKey: .optionalDescription)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case requiredEnum
        case requiredString
        case optionalDescription
    }
}