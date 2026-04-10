import Foundation

public struct CodeExecutionUpdateTwo: Codable, Hashable, Sendable {
    public let submissionId: SubmissionId
    public let errorInfo: ErrorInfo
    public let type: CodeExecutionUpdateTwoType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        submissionId: SubmissionId,
        errorInfo: ErrorInfo,
        type: CodeExecutionUpdateTwoType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.submissionId = submissionId
        self.errorInfo = errorInfo
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.errorInfo = try container.decode(ErrorInfo.self, forKey: .errorInfo)
        self.type = try container.decode(CodeExecutionUpdateTwoType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encode(self.errorInfo, forKey: .errorInfo)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case errorInfo
        case type
    }
}