import Foundation

public struct SubmissionRequestThree: Codable, Hashable, Sendable {
    public let submissionId: SubmissionId
    public let language: Language
    public let submissionFiles: [SubmissionFileInfo]
    public let userId: Nullable<String>?
    public let type: SubmissionRequestThreeType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        submissionId: SubmissionId,
        language: Language,
        submissionFiles: [SubmissionFileInfo],
        userId: Nullable<String>? = nil,
        type: SubmissionRequestThreeType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.submissionId = submissionId
        self.language = language
        self.submissionFiles = submissionFiles
        self.userId = userId
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.language = try container.decode(Language.self, forKey: .language)
        self.submissionFiles = try container.decode([SubmissionFileInfo].self, forKey: .submissionFiles)
        self.userId = try container.decodeNullableIfPresent(String.self, forKey: .userId)
        self.type = try container.decode(SubmissionRequestThreeType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encode(self.language, forKey: .language)
        try container.encode(self.submissionFiles, forKey: .submissionFiles)
        try container.encodeNullableIfPresent(self.userId, forKey: .userId)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case language
        case submissionFiles
        case userId
        case type
    }
}