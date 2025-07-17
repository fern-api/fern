public struct WorkspaceRunDetails: Codable, Hashable {
    public let exceptionV2: ExceptionV2?
    public let exception: ExceptionInfo?
    public let stdout: String
    public let additionalProperties: [String: JSONValue]

    public init(exceptionV2: ExceptionV2? = nil, exception: ExceptionInfo? = nil, stdout: String, additionalProperties: [String: JSONValue] = .init()) {
        self.exceptionV2 = exceptionV2
        self.exception = exception
        self.stdout = stdout
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.exceptionV2 = try container.decodeIfPresent(ExceptionV2.self, forKey: .exceptionV2)
        self.exception = try container.decodeIfPresent(ExceptionInfo.self, forKey: .exception)
        self.stdout = try container.decode(String.self, forKey: .stdout)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.exceptionV2, forKey: .exceptionV2)
        try container.encodeIfPresent(self.exception, forKey: .exception)
        try container.encode(self.stdout, forKey: .stdout)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case exceptionV2
        case exception
        case stdout
    }
}