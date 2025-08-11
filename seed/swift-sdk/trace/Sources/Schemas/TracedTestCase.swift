public struct TracedTestCase: Codable, Hashable, Sendable {
    public let result: TestCaseResultWithStdout
    public let traceResponsesSize: Int
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        result: TestCaseResultWithStdout,
        traceResponsesSize: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.result = result
        self.traceResponsesSize = traceResponsesSize
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.result = try container.decode(TestCaseResultWithStdout.self, forKey: .result)
        self.traceResponsesSize = try container.decode(Int.self, forKey: .traceResponsesSize)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.result, forKey: .result)
        try container.encode(self.traceResponsesSize, forKey: .traceResponsesSize)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case result
        case traceResponsesSize
    }
}