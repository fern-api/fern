public struct VoidFunctionDefinitionThatTakesActualResultType: Codable, Hashable, Sendable {
    public let additionalParameters: [ParameterType]
    public let code: FunctionImplementationForMultipleLanguagesType
    public let additionalProperties: [String: JSONValue]

    public init(
        additionalParameters: [ParameterType],
        code: FunctionImplementationForMultipleLanguagesType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.additionalParameters = additionalParameters
        self.code = code
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.additionalParameters = try container.decode([ParameterType].self, forKey: .additionalParameters)
        self.code = try container.decode(FunctionImplementationForMultipleLanguagesType.self, forKey: .code)
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