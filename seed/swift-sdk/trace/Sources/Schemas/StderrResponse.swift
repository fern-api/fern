public struct StderrResponse: Codable, Hashable {
    public let submissionId: SubmissionId
    public let stderr: String
    public let additionalProperties: [String: JSONValue]

    public init(submissionId: SubmissionId, stderr: String, additionalProperties: [String: JSONValue] = .init()) {
        self.submissionId = submissionId
        self.stderr = stderr
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.stderr = try container.decode(String.self, forKey: .stderr)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encode(self.stderr, forKey: .stderr)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case stderr
    }
}