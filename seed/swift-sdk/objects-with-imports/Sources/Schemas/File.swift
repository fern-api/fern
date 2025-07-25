public struct File: Codable, Hashable, Sendable {
    public let name: String
    public let contents: String
    public let info: FileInfo
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String,
        contents: String,
        info: FileInfo,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.contents = contents
        self.info = info
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.contents = try container.decode(String.self, forKey: .contents)
        self.info = try container.decode(FileInfo.self, forKey: .info)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.contents, forKey: .contents)
        try container.encode(self.info, forKey: .info)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case contents
        case info
    }
}