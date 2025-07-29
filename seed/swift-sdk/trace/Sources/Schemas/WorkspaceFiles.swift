public struct WorkspaceFiles: Codable, Hashable, Sendable {
    public let mainFile: FileInfo
    public let readOnlyFiles: [FileInfo]
    public let additionalProperties: [String: JSONValue]

    public init(
        mainFile: FileInfo,
        readOnlyFiles: [FileInfo],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.mainFile = mainFile
        self.readOnlyFiles = readOnlyFiles
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.mainFile = try container.decode(FileInfo.self, forKey: .mainFile)
        self.readOnlyFiles = try container.decode([FileInfo].self, forKey: .readOnlyFiles)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.mainFile, forKey: .mainFile)
        try container.encode(self.readOnlyFiles, forKey: .readOnlyFiles)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case mainFile
        case readOnlyFiles
    }
}