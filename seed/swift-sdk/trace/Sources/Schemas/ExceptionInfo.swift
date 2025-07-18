public struct ExceptionInfo: Codable, Hashable {
    public let exceptionType: String
    public let exceptionMessage: String
    public let exceptionStacktrace: String
    public let additionalProperties: [String: JSONValue]

    public init(exceptionType: String, exceptionMessage: String, exceptionStacktrace: String, additionalProperties: [String: JSONValue] = .init()) {
        self.exceptionType = exceptionType
        self.exceptionMessage = exceptionMessage
        self.exceptionStacktrace = exceptionStacktrace
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.exceptionType = try container.decode(String.self, forKey: .exceptionType)
        self.exceptionMessage = try container.decode(String.self, forKey: .exceptionMessage)
        self.exceptionStacktrace = try container.decode(String.self, forKey: .exceptionStacktrace)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.exceptionType, forKey: .exceptionType)
        try container.encode(self.exceptionMessage, forKey: .exceptionMessage)
        try container.encode(self.exceptionStacktrace, forKey: .exceptionStacktrace)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case exceptionType
        case exceptionMessage
        case exceptionStacktrace
    }
}