public struct NonVoidFunctionSignatureType: Codable, Hashable, Sendable {
    public let parameters: [ParameterType]
    public let returnType: VariableType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        parameters: [ParameterType],
        returnType: VariableType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.parameters = parameters
        self.returnType = returnType
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.parameters = try container.decode([ParameterType].self, forKey: .parameters)
        self.returnType = try container.decode(VariableType.self, forKey: .returnType)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.parameters, forKey: .parameters)
        try container.encode(self.returnType, forKey: .returnType)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case parameters
        case returnType
    }
}