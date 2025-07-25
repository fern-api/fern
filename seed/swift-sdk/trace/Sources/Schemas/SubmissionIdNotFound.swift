public struct SubmissionIdNotFound: Codable, Hashable, Sendable {
    public let missingSubmissionId: SubmissionId
    public let additionalProperties: [String: JSONValue]

    public init(
        missingSubmissionId: SubmissionId,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.missingSubmissionId = missingSubmissionId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.missingSubmissionId = try container.decode(SubmissionId.self, forKey: .missingSubmissionId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.missingSubmissionId, forKey: .missingSubmissionId)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case missingSubmissionId
    }
}