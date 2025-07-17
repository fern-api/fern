public struct InternalError: Codable, Hashable {
    public let exceptionInfo: ExceptionInfo
    public let additionalProperties: [String: JSONValue]

    public init(exceptionInfo: ExceptionInfo, additionalProperties: [String: JSONValue] = .init()) {
        self.exceptionInfo = exceptionInfo
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.exceptionInfo = try container.decode(ExceptionInfo.self, forKey: .exceptionInfo)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.exceptionInfo, forKey: .exceptionInfo)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case exceptionInfo
    }
}