public struct ErroredResponse: Codable, Hashable {
    public let submissionId: SubmissionId
    public let errorInfo: ErrorInfo
    public let additionalProperties: [String: JSONValue]

    public init(submissionId: SubmissionId, errorInfo: ErrorInfo, additionalProperties: [String: JSONValue] = .init()) {
        self.submissionId = submissionId
        self.errorInfo = errorInfo
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.errorInfo = try container.decode(ErrorInfo.self, forKey: .errorInfo)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encode(self.errorInfo, forKey: .errorInfo)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case errorInfo
    }
}