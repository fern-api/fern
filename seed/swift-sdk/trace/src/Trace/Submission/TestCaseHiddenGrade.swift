public struct TestCaseHiddenGrade: Codable, Hashable {
    public let passed: Bool
    public let additionalProperties: [String: JSONValue]

    public init(passed: Bool, additionalProperties: [String: JSONValue] = .init()) {
        self.passed = passed
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.passed = try container.decode(Bool.self, forKey: .passed)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.passed, forKey: .passed)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case passed
    }
}