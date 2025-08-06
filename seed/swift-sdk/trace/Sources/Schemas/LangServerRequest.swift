public struct LangServerRequest: Codable, Hashable, Sendable {
    public let request: JSONValue
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        request: JSONValue,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.request = request
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.request = try container.decode(JSONValue.self, forKey: .request)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.request, forKey: .request)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case request
    }
}