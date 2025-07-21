public struct GetExecutionSessionStateResponse: Codable, Hashable {
    public let states: Any
    public let numWarmingInstances: Int?
    public let warmingSessionIds: [String]
    public let additionalProperties: [String: JSONValue]

    public init(states: Any, numWarmingInstances: Int? = nil, warmingSessionIds: [String], additionalProperties: [String: JSONValue] = .init()) {
        self.states = states
        self.numWarmingInstances = numWarmingInstances
        self.warmingSessionIds = warmingSessionIds
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.states = try container.decode(Any.self, forKey: .states)
        self.numWarmingInstances = try container.decodeIfPresent(Int.self, forKey: .numWarmingInstances)
        self.warmingSessionIds = try container.decode([String].self, forKey: .warmingSessionIds)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.states, forKey: .states)
        try container.encodeIfPresent(self.numWarmingInstances, forKey: .numWarmingInstances)
        try container.encode(self.warmingSessionIds, forKey: .warmingSessionIds)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case states
        case numWarmingInstances
        case warmingSessionIds
    }
}