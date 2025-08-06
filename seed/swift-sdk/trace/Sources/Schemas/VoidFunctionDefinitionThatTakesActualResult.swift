public struct VoidFunctionDefinitionThatTakesActualResult: Codable, Hashable, Sendable {
    public let additionalParameters: [Parameter]
    public let code: FunctionImplementationForMultipleLanguages
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        additionalParameters: [Parameter],
        code: FunctionImplementationForMultipleLanguages,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.additionalParameters = additionalParameters
        self.code = code
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.additionalParameters = try container.decode([Parameter].self, forKey: .additionalParameters)
        self.code = try container.decode(FunctionImplementationForMultipleLanguages.self, forKey: .code)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.additionalParameters, forKey: .additionalParameters)
        try container.encode(self.code, forKey: .code)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case additionalParameters
        case code
    }
}