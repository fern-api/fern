public struct TestCaseWithExpectedResult: Codable, Hashable, Sendable {
    public let testCase: TestCase
    public let expectedResult: VariableValue
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        testCase: TestCase,
        expectedResult: VariableValue,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.testCase = testCase
        self.expectedResult = expectedResult
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.testCase = try container.decode(TestCase.self, forKey: .testCase)
        self.expectedResult = try container.decode(VariableValue.self, forKey: .expectedResult)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.testCase, forKey: .testCase)
        try container.encode(self.expectedResult, forKey: .expectedResult)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case testCase
        case expectedResult
    }
}