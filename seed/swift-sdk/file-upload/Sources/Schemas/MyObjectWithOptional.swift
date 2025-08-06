public struct MyObjectWithOptional: Codable, Hashable, Sendable {
    public let prop: String
    public let optionalProp: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        prop: String,
        optionalProp: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.prop = prop
        self.optionalProp = optionalProp
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.prop = try container.decode(String.self, forKey: .prop)
        self.optionalProp = try container.decodeIfPresent(String.self, forKey: .optionalProp)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.prop, forKey: .prop)
        try container.encodeIfPresent(self.optionalProp, forKey: .optionalProp)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case prop
        case optionalProp
    }
}