public struct RecordedTestCaseUpdate: Codable, Hashable {
    public let testCaseId: TestCaseId
    public let traceResponsesSize: Int
    public let additionalProperties: [String: JSONValue]

    public init(
        testCaseId: TestCaseId,
        traceResponsesSize: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.testCaseId = testCaseId
        self.traceResponsesSize = traceResponsesSize
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.testCaseId = try container.decode(TestCaseId.self, forKey: .testCaseId)
        self.traceResponsesSize = try container.decode(Int.self, forKey: .traceResponsesSize)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.testCaseId, forKey: .testCaseId)
        try container.encode(self.traceResponsesSize, forKey: .traceResponsesSize)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case testCaseId
        case traceResponsesSize
    }
}