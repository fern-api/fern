public struct GradedResponse: Codable, Hashable {
    public let submissionId: SubmissionId
    public let testCases: Any
    public let additionalProperties: [String: JSONValue]

    public init(submissionId: SubmissionId, testCases: Any, additionalProperties: [String: JSONValue] = .init()) {
        self.submissionId = submissionId
        self.testCases = testCases
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.testCases = try container.decode(Any.self, forKey: .testCases)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encode(self.testCases, forKey: .testCases)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case testCases
    }
}