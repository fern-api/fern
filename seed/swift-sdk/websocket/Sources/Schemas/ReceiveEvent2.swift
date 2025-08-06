public struct ReceiveEvent2: Codable, Hashable, Sendable {
    public let gamma: String
    public let delta: Int
    public let epsilon: Bool
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        gamma: String,
        delta: Int,
        epsilon: Bool,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.gamma = gamma
        self.delta = delta
        self.epsilon = epsilon
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.gamma = try container.decode(String.self, forKey: .gamma)
        self.delta = try container.decode(Int.self, forKey: .delta)
        self.epsilon = try container.decode(Bool.self, forKey: .epsilon)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.gamma, forKey: .gamma)
        try container.encode(self.delta, forKey: .delta)
        try container.encode(self.epsilon, forKey: .epsilon)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case gamma
        case delta
        case epsilon
    }
}