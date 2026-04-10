import Foundation

public struct WorkspaceSubmissionStatusType: Codable, Hashable, Sendable {
    public let type: WorkspaceSubmissionStatusTypeType
    public let value: RunningSubmissionState?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        type: WorkspaceSubmissionStatusTypeType,
        value: RunningSubmissionState? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.type = type
        self.value = value
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decode(WorkspaceSubmissionStatusTypeType.self, forKey: .type)
        self.value = try container.decodeIfPresent(RunningSubmissionState.self, forKey: .value)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.type, forKey: .type)
        try container.encodeIfPresent(self.value, forKey: .value)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}