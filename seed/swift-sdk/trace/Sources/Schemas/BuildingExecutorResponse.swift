public struct BuildingExecutorResponse: Codable, Hashable {
    public let submissionId: SubmissionId
    public let status: ExecutionSessionStatus
    public let additionalProperties: [String: JSONValue]

    public init(submissionId: SubmissionId, status: ExecutionSessionStatus, additionalProperties: [String: JSONValue] = .init()) {
        self.submissionId = submissionId
        self.status = status
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.status = try container.decode(ExecutionSessionStatus.self, forKey: .status)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encode(self.status, forKey: .status)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case status
    }
}