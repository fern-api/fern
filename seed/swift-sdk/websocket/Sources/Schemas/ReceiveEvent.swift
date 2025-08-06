public struct ReceiveEvent: Codable, Hashable, Sendable {
    public let alpha: String
    public let beta: Int
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        alpha: String,
        beta: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.alpha = alpha
        self.beta = beta
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.alpha = try container.decode(String.self, forKey: .alpha)
        self.beta = try container.decode(Int.self, forKey: .beta)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.alpha, forKey: .alpha)
        try container.encode(self.beta, forKey: .beta)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case alpha
        case beta
    }
}