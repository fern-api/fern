public struct TestCaseExpects: Codable, Hashable, Sendable {
    public let expectedStdout: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        expectedStdout: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.expectedStdout = expectedStdout
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.expectedStdout = try container.decodeIfPresent(String.self, forKey: .expectedStdout)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.expectedStdout, forKey: .expectedStdout)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case expectedStdout
    }
}