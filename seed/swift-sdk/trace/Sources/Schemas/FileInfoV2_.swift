public struct FileInfoV2_: Codable, Hashable, Sendable {
    public let filename: String
    public let directory: String
    public let contents: String
    public let editable: Bool
    public let additionalProperties: [String: JSONValue]

    public init(
        filename: String,
        directory: String,
        contents: String,
        editable: Bool,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.filename = filename
        self.directory = directory
        self.contents = contents
        self.editable = editable
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.filename = try container.decode(String.self, forKey: .filename)
        self.directory = try container.decode(String.self, forKey: .directory)
        self.contents = try container.decode(String.self, forKey: .contents)
        self.editable = try container.decode(Bool.self, forKey: .editable)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.filename, forKey: .filename)
        try container.encode(self.directory, forKey: .directory)
        try container.encode(self.contents, forKey: .contents)
        try container.encode(self.editable, forKey: .editable)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case filename
        case directory
        case contents
        case editable
    }
}