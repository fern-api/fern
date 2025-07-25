public struct StdoutResponse: Codable, Hashable {
    public let submissionId: SubmissionId
    public let stdout: String
    public let additionalProperties: [String: JSONValue]

    public init(submissionId: SubmissionId, stdout: String, additionalProperties: [String: JSONValue] = .init()) {
        self.submissionId = submissionId
        self.stdout = stdout
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.stdout = try container.decode(String.self, forKey: .stdout)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encode(self.stdout, forKey: .stdout)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case stdout
    }
}