import Foundation

public struct V2V3GeneratedFiles: Codable, Hashable, Sendable {
    public let generatedTestCaseFiles: [String: V2V3Files]
    public let generatedTemplateFiles: [String: V2V3Files]
    public let other: [String: V2V3Files]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        generatedTestCaseFiles: [String: V2V3Files],
        generatedTemplateFiles: [String: V2V3Files],
        other: [String: V2V3Files],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.generatedTestCaseFiles = generatedTestCaseFiles
        self.generatedTemplateFiles = generatedTemplateFiles
        self.other = other
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.generatedTestCaseFiles = try container.decode([String: V2V3Files].self, forKey: .generatedTestCaseFiles)
        self.generatedTemplateFiles = try container.decode([String: V2V3Files].self, forKey: .generatedTemplateFiles)
        self.other = try container.decode([String: V2V3Files].self, forKey: .other)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.generatedTestCaseFiles, forKey: .generatedTestCaseFiles)
        try container.encode(self.generatedTemplateFiles, forKey: .generatedTemplateFiles)
        try container.encode(self.other, forKey: .other)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case generatedTestCaseFiles
        case generatedTemplateFiles
        case other
    }
}