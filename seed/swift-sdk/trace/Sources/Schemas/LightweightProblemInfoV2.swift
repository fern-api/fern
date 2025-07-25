public struct LightweightProblemInfoV2: Codable, Hashable, Sendable {
    public let problemId: ProblemId
    public let problemName: String
    public let problemVersion: Int
    public let variableTypes: Any
    public let additionalProperties: [String: JSONValue]

    public init(
        problemId: ProblemId,
        problemName: String,
        problemVersion: Int,
        variableTypes: Any,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.problemId = problemId
        self.problemName = problemName
        self.problemVersion = problemVersion
        self.variableTypes = variableTypes
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
        self.problemName = try container.decode(String.self, forKey: .problemName)
        self.problemVersion = try container.decode(Int.self, forKey: .problemVersion)
        self.variableTypes = try container.decode(Any.self, forKey: .variableTypes)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.problemId, forKey: .problemId)
        try container.encode(self.problemName, forKey: .problemName)
        try container.encode(self.problemVersion, forKey: .problemVersion)
        try container.encode(self.variableTypes, forKey: .variableTypes)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case problemId
        case problemName
        case problemVersion
        case variableTypes
    }
}