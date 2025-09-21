public struct DoubleOptional: Codable, Hashable {
    public let optionalAlias: OptionalAlias?
    public let additionalProperties: [String: JSONValue]

    public init(optionalAlias: OptionalAlias? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.optionalAlias = optionalAlias
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.optionalAlias = try container.decodeIfPresent(OptionalAlias.self, forKey: .optionalAlias)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.optionalAlias, forKey: .optionalAlias)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case optionalAlias
    }
}