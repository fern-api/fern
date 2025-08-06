public struct GetBasicSolutionFileResponse: Codable, Hashable, Sendable {
    public let solutionFileByLanguage: [Language: FileInfoV2]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        solutionFileByLanguage: [Language: FileInfoV2],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.solutionFileByLanguage = solutionFileByLanguage
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.solutionFileByLanguage = try container.decode([Language: FileInfoV2].self, forKey: .solutionFileByLanguage)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.solutionFileByLanguage, forKey: .solutionFileByLanguage)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case solutionFileByLanguage
    }
}