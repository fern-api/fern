public struct VoidFunctionSignatureThatTakesActualResultType: Codable, Hashable, Sendable {
    public let parameters: [ParameterType]
    public let actualResultType: VariableType
    public let additionalProperties: [String: JSONValue]

    public init(
        parameters: [ParameterType],
        actualResultType: VariableType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.parameters = parameters
        self.actualResultType = actualResultType
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.parameters = try container.decode([ParameterType].self, forKey: .parameters)
        self.actualResultType = try container.decode(VariableType.self, forKey: .actualResultType)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.parameters, forKey: .parameters)
        try container.encode(self.actualResultType, forKey: .actualResultType)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case parameters
        case actualResultType
    }
}