import Foundation

public struct UnexpectedLanguageError: Codable, Hashable, Sendable {
    public let expectedLanguage: Language
    public let actualLanguage: Language
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        expectedLanguage: Language,
        actualLanguage: Language,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.expectedLanguage = expectedLanguage
        self.actualLanguage = actualLanguage
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.expectedLanguage = try container.decode(Language.self, forKey: .expectedLanguage)
        self.actualLanguage = try container.decode(Language.self, forKey: .actualLanguage)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.expectedLanguage, forKey: .expectedLanguage)
        try container.encode(self.actualLanguage, forKey: .actualLanguage)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case expectedLanguage
        case actualLanguage
    }
}