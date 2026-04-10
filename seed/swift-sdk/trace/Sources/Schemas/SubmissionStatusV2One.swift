import Foundation

public struct SubmissionStatusV2One: Codable, Hashable, Sendable {
    public let updates: [WorkspaceSubmissionUpdate]
    public let type: SubmissionStatusV2OneType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        updates: [WorkspaceSubmissionUpdate],
        type: SubmissionStatusV2OneType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.updates = updates
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.updates = try container.decode([WorkspaceSubmissionUpdate].self, forKey: .updates)
        self.type = try container.decode(SubmissionStatusV2OneType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.updates, forKey: .updates)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case updates
        case type
    }
}