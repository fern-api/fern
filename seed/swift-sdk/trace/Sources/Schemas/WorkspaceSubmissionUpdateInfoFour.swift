import Foundation

public struct WorkspaceSubmissionUpdateInfoFour: Codable, Hashable, Sendable {
    public let traceResponsesSize: Int
    public let type: WorkspaceSubmissionUpdateInfoFourType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        traceResponsesSize: Int,
        type: WorkspaceSubmissionUpdateInfoFourType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.traceResponsesSize = traceResponsesSize
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.traceResponsesSize = try container.decode(Int.self, forKey: .traceResponsesSize)
        self.type = try container.decode(WorkspaceSubmissionUpdateInfoFourType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.traceResponsesSize, forKey: .traceResponsesSize)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case traceResponsesSize
        case type
    }
}