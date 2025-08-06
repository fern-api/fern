public struct SubmissionFileInfo: Codable, Hashable, Sendable {
    public let directory: String
    public let filename: String
    public let contents: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        directory: String,
        filename: String,
        contents: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.directory = directory
        self.filename = filename
        self.contents = contents
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.directory = try container.decode(String.self, forKey: .directory)
        self.filename = try container.decode(String.self, forKey: .filename)
        self.contents = try container.decode(String.self, forKey: .contents)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.directory, forKey: .directory)
        try container.encode(self.filename, forKey: .filename)
        try container.encode(self.contents, forKey: .contents)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case directory
        case filename
        case contents
    }
}