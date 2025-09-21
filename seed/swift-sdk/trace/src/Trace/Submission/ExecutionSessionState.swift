public struct ExecutionSessionState: Codable, Hashable {
    public let lastTimeContacted: String?
    public let sessionId: String
    public let isWarmInstance: Bool
    public let awsTaskId: String?
    public let language: Language
    public let status: ExecutionSessionStatus
    public let additionalProperties: [String: JSONValue]

    public init(lastTimeContacted: String? = nil, sessionId: String, isWarmInstance: Bool, awsTaskId: String? = nil, language: Language, status: ExecutionSessionStatus, additionalProperties: [String: JSONValue] = .init()) {
        self.lastTimeContacted = lastTimeContacted
        self.sessionId = sessionId
        self.isWarmInstance = isWarmInstance
        self.awsTaskId = awsTaskId
        self.language = language
        self.status = status
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.lastTimeContacted = try container.decodeIfPresent(String.self, forKey: .lastTimeContacted)
        self.sessionId = try container.decode(String.self, forKey: .sessionId)
        self.isWarmInstance = try container.decode(Bool.self, forKey: .isWarmInstance)
        self.awsTaskId = try container.decodeIfPresent(String.self, forKey: .awsTaskId)
        self.language = try container.decode(Language.self, forKey: .language)
        self.status = try container.decode(ExecutionSessionStatus.self, forKey: .status)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.lastTimeContacted, forKey: .lastTimeContacted)
        try container.encode(self.sessionId, forKey: .sessionId)
        try container.encode(self.isWarmInstance, forKey: .isWarmInstance)
        try container.encodeIfPresent(self.awsTaskId, forKey: .awsTaskId)
        try container.encode(self.language, forKey: .language)
        try container.encode(self.status, forKey: .status)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case lastTimeContacted
        case sessionId
        case isWarmInstance
        case awsTaskId
        case language
        case status
    }
}