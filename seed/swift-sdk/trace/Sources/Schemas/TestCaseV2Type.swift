public struct TestCaseV2Type: Codable, Hashable, Sendable {
    public let metadata: TestCaseMetadataType
    public let implementation: TestCaseImplementationReferenceType
    public let arguments: [ParameterIdType: VariableValue]
    public let expects: TestCaseExpectsType?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        metadata: TestCaseMetadataType,
        implementation: TestCaseImplementationReferenceType,
        arguments: [ParameterIdType: VariableValue],
        expects: TestCaseExpectsType? = nil,
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
        self.metadata = try container.decode(TestCaseMetadataType.self, forKey: .metadata)
        self.implementation = try container.decode(TestCaseImplementationReferenceType.self, forKey: .implementation)
        self.arguments = try container.decode([ParameterIdType: VariableValue].self, forKey: .arguments)
        self.expects = try container.decodeIfPresent(TestCaseExpectsType.self, forKey: .expects)
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

    enum CodingKeys: String, CodingKey, CaseIterable {
        case metadata
        case implementation
        case arguments
        case expects
    }
}