public struct WorkspaceStarterFilesResponseV2: Codable, Hashable {
    public let filesByLanguage: Any
    public let additionalProperties: [String: JSONValue]

    public init(filesByLanguage: Any, additionalProperties: [String: JSONValue] = .init()) {
        self.filesByLanguage = filesByLanguage
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.filesByLanguage = try container.decode(Any.self, forKey: .filesByLanguage)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.filesByLanguage, forKey: .filesByLanguage)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case filesByLanguage
    }
}