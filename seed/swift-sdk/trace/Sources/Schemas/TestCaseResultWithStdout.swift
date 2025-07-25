public struct TestCaseResultWithStdout: Codable, Hashable, Sendable {
    public let result: TestCaseResult
    public let stdout: String
    public let additionalProperties: [String: JSONValue]

    public init(
        result: TestCaseResult,
        stdout: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.result = result
        self.stdout = stdout
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.result = try container.decode(TestCaseResult.self, forKey: .result)
        self.stdout = try container.decode(String.self, forKey: .stdout)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.result, forKey: .result)
        try container.encode(self.stdout, forKey: .stdout)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case result
        case stdout
    }
}