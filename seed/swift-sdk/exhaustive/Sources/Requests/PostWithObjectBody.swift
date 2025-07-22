public struct PostWithObjectBody: Codable, Hashable {
    public let string: String
    public let integer: Int
    public let nestedObject: ObjectWithOptionalField
    public let additionalProperties: [String: JSONValue]

    public init(string: String, integer: Int, nestedObject: ObjectWithOptionalField, additionalProperties: [String: JSONValue] = .init()) {
        self.string = string
        self.integer = integer
        self.nestedObject = nestedObject
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.string = try container.decode(String.self, forKey: .string)
        self.integer = try container.decode(Int.self, forKey: .integer)
        self.nestedObject = try container.decode(ObjectWithOptionalField.self, forKey: .nestedObject)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.string, forKey: .string)
        try container.encode(self.integer, forKey: .integer)
        try container.encode(self.nestedObject, forKey: .nestedObject)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case string
        case integer
        case nestedObject = "NestedObject"
    }
}