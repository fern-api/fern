import Foundation

public struct SubmissionTypeStateOne: Codable, Hashable, Sendable {
    public let status: WorkspaceSubmissionStatus
    public let type: SubmissionTypeStateOneType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        status: WorkspaceSubmissionStatus,
        type: SubmissionTypeStateOneType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.status = status
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.status = try container.decode(WorkspaceSubmissionStatus.self, forKey: .status)
        self.type = try container.decode(SubmissionTypeStateOneType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.status, forKey: .status)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case status
        case type
    }
}