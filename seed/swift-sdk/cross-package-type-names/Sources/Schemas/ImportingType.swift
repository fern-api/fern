public struct ImportingType: Codable, Hashable {
    public let imported: Imported
    public let additionalProperties: [String: JSONValue]

    public init(imported: Imported, additionalProperties: [String: JSONValue] = .init()) {
        self.imported = imported
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.imported = try container.decode(Imported.self, forKey: .imported)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.imported, forKey: .imported)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case imported
    }
}