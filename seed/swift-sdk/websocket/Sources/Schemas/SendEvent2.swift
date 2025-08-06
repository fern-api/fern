public struct SendEvent2: Codable, Hashable, Sendable {
    public let sendText2: String
    public let sendParam2: Bool
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        sendText2: String,
        sendParam2: Bool,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.sendText2 = sendText2
        self.sendParam2 = sendParam2
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.sendText2 = try container.decode(String.self, forKey: .sendText2)
        self.sendParam2 = try container.decode(Bool.self, forKey: .sendParam2)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.sendText2, forKey: .sendText2)
        try container.encode(self.sendParam2, forKey: .sendParam2)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case sendText2
        case sendParam2
    }
}