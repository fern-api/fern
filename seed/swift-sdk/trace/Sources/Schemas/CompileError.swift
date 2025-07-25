public struct CompileError: Codable, Hashable {
    public let message: String
    public let additionalProperties: [String: JSONValue]

    public init(message: String, additionalProperties: [String: JSONValue] = .init()) {
        self.message = message
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.message = try container.decode(String.self, forKey: .message)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.message, forKey: .message)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case message
    }
}