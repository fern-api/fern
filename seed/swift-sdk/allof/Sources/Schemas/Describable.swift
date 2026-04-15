import Foundation

public struct Describable: Codable, Hashable, Sendable {
    /// Display name from Describable.
    public let name: String?
    /// A short summary.
    public let summary: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String? = nil,
        summary: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.summary = summary
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decodeIfPresent(String.self, forKey: .name)
        self.summary = try container.decodeIfPresent(String.self, forKey: .summary)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.name, forKey: .name)
        try container.encodeIfPresent(self.summary, forKey: .summary)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case summary
    }
}