public struct GenericValue: Codable, Hashable {
    public let stringifiedType: String?
    public let stringifiedValue: String
    public let additionalProperties: [String: JSONValue]

    public init(stringifiedType: String? = nil, stringifiedValue: String, additionalProperties: [String: JSONValue] = .init()) {
        self.stringifiedType = stringifiedType
        self.stringifiedValue = stringifiedValue
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.stringifiedType = try container.decodeIfPresent(String.self, forKey: .stringifiedType)
        self.stringifiedValue = try container.decode(String.self, forKey: .stringifiedValue)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.stringifiedType, forKey: .stringifiedType)
        try container.encode(self.stringifiedValue, forKey: .stringifiedValue)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case stringifiedType
        case stringifiedValue
    }
}