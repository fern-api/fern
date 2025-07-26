public struct GetGeneratedTestCaseFileRequest: Codable, Hashable, Sendable {
    public let template: TestCaseTemplate?
    public let testCase: TestCaseV2
    public let additionalProperties: [String: JSONValue]

    public init(
        template: TestCaseTemplate? = nil,
        testCase: TestCaseV2,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.template = template
        self.testCase = testCase
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.template = try container.decodeIfPresent(TestCaseTemplate.self, forKey: .template)
        self.testCase = try container.decode(TestCaseV2.self, forKey: .testCase)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.template, forKey: .template)
        try container.encode(self.testCase, forKey: .testCase)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case template
        case testCase
    }
}