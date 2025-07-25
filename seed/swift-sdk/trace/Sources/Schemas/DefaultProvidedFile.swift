public struct DefaultProvidedFile: Codable, Hashable, Sendable {
    public let file: FileInfoV2
    public let relatedTypes: [VariableType]
    public let additionalProperties: [String: JSONValue]

    public init(
        file: FileInfoV2,
        relatedTypes: [VariableType],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.file = file
        self.relatedTypes = relatedTypes
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.file = try container.decode(FileInfoV2.self, forKey: .file)
        self.relatedTypes = try container.decode([VariableType].self, forKey: .relatedTypes)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.file, forKey: .file)
        try container.encode(self.relatedTypes, forKey: .relatedTypes)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case file
        case relatedTypes
    }
}