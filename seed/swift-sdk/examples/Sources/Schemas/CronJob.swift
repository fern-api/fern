public struct CronJob: Codable, Hashable {
    public let expression: String
    public let additionalProperties: [String: JSONValue]

    public init(
        expression: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.expression = expression
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.expression = try container.decode(String.self, forKey: .expression)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.expression, forKey: .expression)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case expression
    }
}