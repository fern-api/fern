import Foundation

public struct CodeExecutionUpdateFour: Codable, Hashable, Sendable {
    public let submissionId: SubmissionId
    public let testCases: [String: TestCaseResultWithStdout]
    public let type: CodeExecutionUpdateFourType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        submissionId: SubmissionId,
        testCases: [String: TestCaseResultWithStdout],
        type: CodeExecutionUpdateFourType,
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
        self.testCases = try container.decode([String: TestCaseResultWithStdout].self, forKey: .testCases)
        self.type = try container.decode(CodeExecutionUpdateFourType.self, forKey: .type)
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