public struct ExecutionSessionResponse: Codable, Hashable, Sendable {
    public let sessionId: String
    public let executionSessionUrl: String?
    public let language: Language
    public let status: ExecutionSessionStatus
    public let additionalProperties: [String: JSONValue]

    public init(
        sessionId: String,
        executionSessionUrl: String? = nil,
        language: Language,
        status: ExecutionSessionStatus,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.sessionId = sessionId
        self.executionSessionUrl = executionSessionUrl
        self.language = language
        self.status = status
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.sessionId = try container.decode(String.self, forKey: .sessionId)
        self.executionSessionUrl = try container.decodeIfPresent(String.self, forKey: .executionSessionUrl)
        self.language = try container.decode(Language.self, forKey: .language)
        self.status = try container.decode(ExecutionSessionStatus.self, forKey: .status)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.sessionId, forKey: .sessionId)
        try container.encodeIfPresent(self.executionSessionUrl, forKey: .executionSessionUrl)
        try container.encode(self.language, forKey: .language)
        try container.encode(self.status, forKey: .status)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case sessionId
        case executionSessionUrl
        case language
        case status
    }
}