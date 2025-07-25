public struct FolderCFoo: Codable, Hashable {
    public let barProperty: UUID
    public let additionalProperties: [String: JSONValue]

    public init(barProperty: UUID, additionalProperties: [String: JSONValue] = .init()) {
        self.barProperty = barProperty
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.barProperty = try container.decode(UUID.self, forKey: .barProperty)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.barProperty, forKey: .barProperty)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case barProperty = "bar_property"
    }
}