import Foundation

public struct V2V3BasicTestCaseTemplate: Codable, Hashable, Sendable {
    public let templateId: V2V3TestCaseTemplateId
    public let name: String
    public let description: V2V3TestCaseImplementationDescription
    public let expectedValueParameterId: V2V3ParameterId
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        templateId: V2V3TestCaseTemplateId,
        name: String,
        description: V2V3TestCaseImplementationDescription,
        expectedValueParameterId: V2V3ParameterId,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.templateId = templateId
        self.name = name
        self.description = description
        self.expectedValueParameterId = expectedValueParameterId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.templateId = try container.decode(V2V3TestCaseTemplateId.self, forKey: .templateId)
        self.name = try container.decode(String.self, forKey: .name)
        self.description = try container.decode(V2V3TestCaseImplementationDescription.self, forKey: .description)
        self.expectedValueParameterId = try container.decode(V2V3ParameterId.self, forKey: .expectedValueParameterId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.templateId, forKey: .templateId)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.description, forKey: .description)
        try container.encode(self.expectedValueParameterId, forKey: .expectedValueParameterId)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case templateId
        case name
        case description
        case expectedValueParameterId
    }
}