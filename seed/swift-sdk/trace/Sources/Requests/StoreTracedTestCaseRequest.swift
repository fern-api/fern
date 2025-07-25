public struct StoreTracedTestCaseRequest: Codable, Hashable {
    public let result: TestCaseResultWithStdout
    public let traceResponses: [TraceResponse]
    public let additionalProperties: [String: JSONValue]

    public init(result: TestCaseResultWithStdout, traceResponses: [TraceResponse], additionalProperties: [String: JSONValue] = .init()) {
        self.result = result
        self.traceResponses = traceResponses
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.result = try container.decode(TestCaseResultWithStdout.self, forKey: .result)
        self.traceResponses = try container.decode([TraceResponse].self, forKey: .traceResponses)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.result, forKey: .result)
        try container.encode(self.traceResponses, forKey: .traceResponses)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case result
        case traceResponses
    }
}