public struct NestedObjectWithOptionalField: Codable, Hashable {
    public let string: String?
    public let nestedObject: ObjectWithOptionalField?
    public let additionalProperties: [String: JSONValue]

    public init(string: String? = nil, nestedObject: ObjectWithOptionalField? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.string = string
        self.nestedObject = nestedObject
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.string = try container.decodeIfPresent(String.self, forKey: .string)
        self.nestedObject = try container.decodeIfPresent(ObjectWithOptionalField.self, forKey: .nestedObject)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.string, forKey: .string)
        try container.encodeIfPresent(self.nestedObject, forKey: .nestedObject)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case string
        case nestedObject = "NestedObject"
    }
}