import Foundation

public struct CodeExecutionUpdateZero: Codable, Hashable, Sendable {
    public let submissionId: SubmissionId
    public let status: ExecutionSessionStatus
    public let type: CodeExecutionUpdateZeroType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        submissionId: SubmissionId,
        status: ExecutionSessionStatus,
        type: CodeExecutionUpdateZeroType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.submissionId = submissionId
        self.status = status
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.status = try container.decode(ExecutionSessionStatus.self, forKey: .status)
        self.type = try container.decode(CodeExecutionUpdateZeroType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encode(self.status, forKey: .status)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case status
        case type
    }
}