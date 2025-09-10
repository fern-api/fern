import Foundation

public struct GetGeneratedTestCaseTemplateFileRequest: Codable, Hashable, Sendable {
    public let template: TestCaseTemplate
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        template: TestCaseTemplate,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.template = template
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.template = try container.decode(TestCaseTemplate.self, forKey: .template)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.template, forKey: .template)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case template
    }
}