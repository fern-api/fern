import Foundation

public struct V2CustomFilesZero: Codable, Hashable, Sendable {
    public let methodName: String
    public let signature: V2NonVoidFunctionSignature
    public let additionalFiles: [String: V2Files]
    public let basicTestCaseTemplate: V2BasicTestCaseTemplate
    public let type: V2CustomFilesZeroType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        methodName: String,
        signature: V2NonVoidFunctionSignature,
        additionalFiles: [String: V2Files],
        basicTestCaseTemplate: V2BasicTestCaseTemplate,
        type: V2CustomFilesZeroType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.methodName = methodName
        self.signature = signature
        self.additionalFiles = additionalFiles
        self.basicTestCaseTemplate = basicTestCaseTemplate
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.methodName = try container.decode(String.self, forKey: .methodName)
        self.signature = try container.decode(V2NonVoidFunctionSignature.self, forKey: .signature)
        self.additionalFiles = try container.decode([String: V2Files].self, forKey: .additionalFiles)
        self.basicTestCaseTemplate = try container.decode(V2BasicTestCaseTemplate.self, forKey: .basicTestCaseTemplate)
        self.type = try container.decode(V2CustomFilesZeroType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.methodName, forKey: .methodName)
        try container.encode(self.signature, forKey: .signature)
        try container.encode(self.additionalFiles, forKey: .additionalFiles)
        try container.encode(self.basicTestCaseTemplate, forKey: .basicTestCaseTemplate)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case methodName
        case signature
        case additionalFiles
        case basicTestCaseTemplate
        case type
    }
}