import Foundation

public struct CodeExecutionUpdateSix: Codable, Hashable, Sendable {
    public let submissionId: SubmissionId
    public let runDetails: WorkspaceRunDetails
    public let type: CodeExecutionUpdateSixType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        submissionId: SubmissionId,
        runDetails: WorkspaceRunDetails,
        type: CodeExecutionUpdateSixType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.submissionId = submissionId
        self.runDetails = runDetails
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.runDetails = try container.decode(WorkspaceRunDetails.self, forKey: .runDetails)
        self.type = try container.decode(CodeExecutionUpdateSixType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encode(self.runDetails, forKey: .runDetails)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case runDetails
        case type
    }
}