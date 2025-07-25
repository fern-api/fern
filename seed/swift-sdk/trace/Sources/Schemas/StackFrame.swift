public struct StackFrame: Codable, Hashable {
    public let methodName: String
    public let lineNumber: Int
    public let scopes: [Scope]
    public let additionalProperties: [String: JSONValue]

    public init(methodName: String, lineNumber: Int, scopes: [Scope], additionalProperties: [String: JSONValue] = .init()) {
        self.methodName = methodName
        self.lineNumber = lineNumber
        self.scopes = scopes
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.methodName = try container.decode(String.self, forKey: .methodName)
        self.lineNumber = try container.decode(Int.self, forKey: .lineNumber)
        self.scopes = try container.decode([Scope].self, forKey: .scopes)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.methodName, forKey: .methodName)
        try container.encode(self.lineNumber, forKey: .lineNumber)
        try container.encode(self.scopes, forKey: .scopes)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case methodName
        case lineNumber
        case scopes
    }
}