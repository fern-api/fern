public struct ReceiveSnakeCase: Codable, Hashable, Sendable {
    public let receiveText: String
    public let receiveInt: Int
    public let additionalProperties: [String: JSONValue]

    public init(
        receiveText: String,
        receiveInt: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.receiveText = receiveText
        self.receiveInt = receiveInt
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.receiveText = try container.decode(String.self, forKey: .receiveText)
        self.receiveInt = try container.decode(Int.self, forKey: .receiveInt)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.receiveText, forKey: .receiveText)
        try container.encode(self.receiveInt, forKey: .receiveInt)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case receiveText = "receive_text"
        case receiveInt = "receive_int"
    }
}