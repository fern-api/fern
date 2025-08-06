public struct InitializeProblemRequest: Codable, Hashable, Sendable {
    public let problemId: ProblemId
    public let problemVersion: Int?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        problemId: ProblemId,
        problemVersion: Int? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.problemId = problemId
        self.problemVersion = problemVersion
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
        self.problemVersion = try container.decodeIfPresent(Int.self, forKey: .problemVersion)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.problemId, forKey: .problemId)
        try container.encodeIfPresent(self.problemVersion, forKey: .problemVersion)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case problemId
        case problemVersion
    }
}