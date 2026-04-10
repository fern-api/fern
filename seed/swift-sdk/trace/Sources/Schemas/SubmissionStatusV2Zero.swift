import Foundation

public struct SubmissionStatusV2Zero: Codable, Hashable, Sendable {
    public let updates: [TestSubmissionUpdate]
    public let problemId: ProblemId
    public let problemVersion: Int
    public let problemInfo: V2ProblemInfoV2
    public let type: SubmissionStatusV2ZeroType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        updates: [TestSubmissionUpdate],
        problemId: ProblemId,
        problemVersion: Int,
        problemInfo: V2ProblemInfoV2,
        type: SubmissionStatusV2ZeroType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.updates = updates
        self.problemId = problemId
        self.problemVersion = problemVersion
        self.problemInfo = problemInfo
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.updates = try container.decode([TestSubmissionUpdate].self, forKey: .updates)
        self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
        self.problemVersion = try container.decode(Int.self, forKey: .problemVersion)
        self.problemInfo = try container.decode(V2ProblemInfoV2.self, forKey: .problemInfo)
        self.type = try container.decode(SubmissionStatusV2ZeroType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.updates, forKey: .updates)
        try container.encode(self.problemId, forKey: .problemId)
        try container.encode(self.problemVersion, forKey: .problemVersion)
        try container.encode(self.problemInfo, forKey: .problemInfo)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case updates
        case problemId
        case problemVersion
        case problemInfo
        case type
    }
}