public struct TestCaseResult: Codable, Hashable {
    public let expectedResult: VariableValue
    public let actualResult: ActualResult
    public let passed: Bool
    public let additionalProperties: [String: JSONValue]

    public init(expectedResult: VariableValue, actualResult: ActualResult, passed: Bool, additionalProperties: [String: JSONValue] = .init()) {
        self.expectedResult = expectedResult
        self.actualResult = actualResult
        self.passed = passed
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.expectedResult = try container.decode(VariableValue.self, forKey: .expectedResult)
        self.actualResult = try container.decode(ActualResult.self, forKey: .actualResult)
        self.passed = try container.decode(Bool.self, forKey: .passed)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.expectedResult, forKey: .expectedResult)
        try container.encode(self.actualResult, forKey: .actualResult)
        try container.encode(self.passed, forKey: .passed)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case expectedResult
        case actualResult
        case passed
    }
}