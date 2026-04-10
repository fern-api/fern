import Foundation

public struct CodeExecutionUpdateEight: Codable, Hashable, Sendable {
    public let submissionId: SubmissionId
    public let traceResponsesSize: Int
    public let testCaseId: Nullable<String>?
    public let type: CodeExecutionUpdateEightType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        submissionId: SubmissionId,
        traceResponsesSize: Int,
        testCaseId: Nullable<String>? = nil,
        type: CodeExecutionUpdateEightType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.submissionId = submissionId
        self.traceResponsesSize = traceResponsesSize
        self.testCaseId = testCaseId
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.traceResponsesSize = try container.decode(Int.self, forKey: .traceResponsesSize)
        self.testCaseId = try container.decodeNullableIfPresent(String.self, forKey: .testCaseId)
        self.type = try container.decode(CodeExecutionUpdateEightType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encode(self.traceResponsesSize, forKey: .traceResponsesSize)
        try container.encodeNullableIfPresent(self.testCaseId, forKey: .testCaseId)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case traceResponsesSize
        case testCaseId
        case type
    }
}