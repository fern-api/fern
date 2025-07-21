public struct LangServerResponse: Codable, Hashable {
    public let response: Any
    public let additionalProperties: [String: JSONValue]

    public init(response: Any, additionalProperties: [String: JSONValue] = .init()) {
        self.response = response
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.response = try container.decode(Any.self, forKey: .response)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.response, forKey: .response)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case response
    }
}