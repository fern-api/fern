import Foundation

public struct V2V3FunctionImplementationForMultipleLanguages: Codable, Hashable, Sendable {
    public let codeByLanguage: [String: V2V3FunctionImplementation]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        codeByLanguage: [String: V2V3FunctionImplementation],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.codeByLanguage = codeByLanguage
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.codeByLanguage = try container.decode([String: V2V3FunctionImplementation].self, forKey: .codeByLanguage)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.codeByLanguage, forKey: .codeByLanguage)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case codeByLanguage
    }
}