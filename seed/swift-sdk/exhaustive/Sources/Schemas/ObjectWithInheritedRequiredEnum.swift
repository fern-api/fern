import Foundation

/// A base object that has a required enum field, preventing Default derive
/// in Rust because enums don't implement Default.
public struct ObjectWithInheritedRequiredEnum: Codable, Hashable, Sendable {
    public let requiredEnum: WeatherReport
    public let requiredString: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        requiredEnum: WeatherReport,
        requiredString: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.requiredEnum = requiredEnum
        self.requiredString = requiredString
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.requiredEnum = try container.decode(WeatherReport.self, forKey: .requiredEnum)
        self.requiredString = try container.decode(String.self, forKey: .requiredString)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.requiredEnum, forKey: .requiredEnum)
        try container.encode(self.requiredString, forKey: .requiredString)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case requiredEnum
        case requiredString
    }
}