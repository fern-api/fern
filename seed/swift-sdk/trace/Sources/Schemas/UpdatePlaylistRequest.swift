public struct UpdatePlaylistRequest: Codable, Hashable {
    public let name: String
    public let problems: [ProblemId]
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String,
        problems: [ProblemId],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.problems = problems
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.problems = try container.decode([ProblemId].self, forKey: .problems)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.problems, forKey: .problems)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case problems
    }
}