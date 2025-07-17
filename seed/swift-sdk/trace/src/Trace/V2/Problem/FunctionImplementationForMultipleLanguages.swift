public struct FunctionImplementationForMultipleLanguages: Codable, Hashable {
    public let codeByLanguage: Any
    public let additionalProperties: [String: JSONValue]

    public init(codeByLanguage: Any, additionalProperties: [String: JSONValue] = .init()) {
        self.codeByLanguage = codeByLanguage
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.codeByLanguage = try container.decode(Any.self, forKey: .codeByLanguage)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.codeByLanguage, forKey: .codeByLanguage)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case codeByLanguage
    }
}