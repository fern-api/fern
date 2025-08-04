public struct FilesType: Codable, Hashable, Sendable {
    public let files: [FileInfoV2]
    public let additionalProperties: [String: JSONValue]

    public init(
        files: [FileInfoV2],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.files = files
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.files = try container.decode([FileInfoV2].self, forKey: .files)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.files, forKey: .files)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case files
    }
}