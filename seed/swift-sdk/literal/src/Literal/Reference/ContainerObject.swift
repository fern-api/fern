public struct ContainerObject: Codable, Hashable {
    public let nestedObjects: [NestedObjectWithLiterals]
    public let additionalProperties: [String: JSONValue]

    public init(nestedObjects: [NestedObjectWithLiterals], additionalProperties: [String: JSONValue] = .init()) {
        self.nestedObjects = nestedObjects
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.nestedObjects = try container.decode([NestedObjectWithLiterals].self, forKey: .nestedObjects)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.nestedObjects, forKey: .nestedObjects)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case nestedObjects
    }
}