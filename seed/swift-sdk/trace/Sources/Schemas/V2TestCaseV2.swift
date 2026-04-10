import Foundation

public struct V2TestCaseV2: Codable, Hashable, Sendable {
    public let metadata: V2TestCaseMetadata
    public let implementation: V2TestCaseImplementationReference
    public let arguments: [String: VariableValue]
    public let expects: V2TestCaseExpects?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        metadata: V2TestCaseMetadata,
        implementation: V2TestCaseImplementationReference,
        arguments: [String: VariableValue],
        expects: V2TestCaseExpects? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.metadata = metadata
        self.implementation = implementation
        self.arguments = arguments
        self.expects = expects
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.metadata = try container.decode(V2TestCaseMetadata.self, forKey: .metadata)
        self.implementation = try container.decode(V2TestCaseImplementationReference.self, forKey: .implementation)
        self.arguments = try container.decode([String: VariableValue].self, forKey: .arguments)
        self.expects = try container.decodeIfPresent(V2TestCaseExpects.self, forKey: .expects)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.metadata, forKey: .metadata)
        try container.encode(self.implementation, forKey: .implementation)
        try container.encode(self.arguments, forKey: .arguments)
        try container.encodeIfPresent(self.expects, forKey: .expects)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case metadata
        case implementation
        case arguments
        case expects
    }
}