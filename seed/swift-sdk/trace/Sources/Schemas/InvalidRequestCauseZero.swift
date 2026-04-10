import Foundation

public struct InvalidRequestCauseZero: Codable, Hashable, Sendable {
    public let missingSubmissionId: SubmissionId
    public let type: InvalidRequestCauseZeroType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        missingSubmissionId: SubmissionId,
        type: InvalidRequestCauseZeroType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.missingSubmissionId = missingSubmissionId
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.missingSubmissionId = try container.decode(SubmissionId.self, forKey: .missingSubmissionId)
        self.type = try container.decode(InvalidRequestCauseZeroType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.missingSubmissionId, forKey: .missingSubmissionId)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case missingSubmissionId
        case type
    }
}