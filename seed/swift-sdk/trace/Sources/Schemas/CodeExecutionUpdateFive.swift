import Foundation

public struct CodeExecutionUpdateFive: Codable, Hashable, Sendable {
    public let submissionId: SubmissionId
    public let testCases: [String: TestCaseGrade]
    public let type: CodeExecutionUpdateFiveType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        submissionId: SubmissionId,
        testCases: [String: TestCaseGrade],
        type: CodeExecutionUpdateFiveType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.submissionId = submissionId
        self.testCases = testCases
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.testCases = try container.decode([String: TestCaseGrade].self, forKey: .testCases)
        self.type = try container.decode(CodeExecutionUpdateFiveType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encode(self.testCases, forKey: .testCases)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case testCases
        case type
    }
}