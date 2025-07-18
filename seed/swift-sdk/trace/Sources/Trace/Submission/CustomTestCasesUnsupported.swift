public struct CustomTestCasesUnsupported: Codable, Hashable {
    public let problemId: ProblemId
    public let submissionId: SubmissionId
    public let additionalProperties: [String: JSONValue]

    public init(problemId: ProblemId, submissionId: SubmissionId, additionalProperties: [String: JSONValue] = .init()) {
        self.problemId = problemId
        self.submissionId = submissionId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.problemId, forKey: .problemId)
        try container.encode(self.submissionId, forKey: .submissionId)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case problemId
        case submissionId
    }
}