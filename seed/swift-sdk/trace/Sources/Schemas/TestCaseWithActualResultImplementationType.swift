public struct TestCaseWithActualResultImplementationType: Codable, Hashable, Sendable {
    public let getActualResult: NonVoidFunctionDefinitionType
    public let assertCorrectnessCheck: AssertCorrectnessCheckType
    public let additionalProperties: [String: JSONValue]

    public init(
        getActualResult: NonVoidFunctionDefinitionType,
        assertCorrectnessCheck: AssertCorrectnessCheckType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.getActualResult = getActualResult
        self.assertCorrectnessCheck = assertCorrectnessCheck
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.getActualResult = try container.decode(NonVoidFunctionDefinitionType.self, forKey: .getActualResult)
        self.assertCorrectnessCheck = try container.decode(AssertCorrectnessCheckType.self, forKey: .assertCorrectnessCheck)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.getActualResult, forKey: .getActualResult)
        try container.encode(self.assertCorrectnessCheck, forKey: .assertCorrectnessCheck)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case getActualResult
        case assertCorrectnessCheck
    }
}