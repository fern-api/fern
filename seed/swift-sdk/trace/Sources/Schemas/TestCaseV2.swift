public struct TestCaseV2: Codable, Hashable {
    public let metadata: TestCaseMetadata
    public let implementation: TestCaseImplementationReference
    public let arguments: [ParameterId: VariableValue]
    public let expects: TestCaseExpects?
    public let additionalProperties: [String: JSONValue]

    public init(
        metadata: TestCaseMetadata,
        implementation: TestCaseImplementationReference,
        arguments: [ParameterId: VariableValue],
        expects: TestCaseExpects? = nil,
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
        self.metadata = try container.decode(TestCaseMetadata.self, forKey: .metadata)
        self.implementation = try container.decode(TestCaseImplementationReference.self, forKey: .implementation)
        self.arguments = try container.decode([ParameterId: VariableValue].self, forKey: .arguments)
        self.expects = try container.decodeIfPresent(TestCaseExpects.self, forKey: .expects)
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