public struct ProblemFiles: Codable, Hashable, Sendable {
    public let solutionFile: FileInfo
    public let readOnlyFiles: [FileInfo]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        solutionFile: FileInfo,
        readOnlyFiles: [FileInfo],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.solutionFile = solutionFile
        self.readOnlyFiles = readOnlyFiles
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.solutionFile = try container.decode(FileInfo.self, forKey: .solutionFile)
        self.readOnlyFiles = try container.decode([FileInfo].self, forKey: .readOnlyFiles)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.solutionFile, forKey: .solutionFile)
        try container.encode(self.readOnlyFiles, forKey: .readOnlyFiles)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case solutionFile
        case readOnlyFiles
    }
}