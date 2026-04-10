import Foundation

public struct CodeExecutionUpdateThree: Codable, Hashable, Sendable {
    public let submissionId: SubmissionId
    public let type: CodeExecutionUpdateThreeType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        submissionId: SubmissionId,
        type: CodeExecutionUpdateThreeType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.submissionId = submissionId
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.type = try container.decode(CodeExecutionUpdateThreeType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case type
    }
}