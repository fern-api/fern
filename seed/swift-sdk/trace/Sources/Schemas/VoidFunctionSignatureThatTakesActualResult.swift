public struct VoidFunctionSignatureThatTakesActualResult: Codable, Hashable, Sendable {
    public let parameters: [Parameter]
    public let actualResultType: VariableType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        parameters: [Parameter],
        actualResultType: VariableType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.parameters = parameters
        self.actualResultType = actualResultType
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.parameters = try container.decode([Parameter].self, forKey: .parameters)
        self.actualResultType = try container.decode(VariableType.self, forKey: .actualResultType)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.parameters, forKey: .parameters)
        try container.encode(self.actualResultType, forKey: .actualResultType)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case parameters
        case actualResultType
    }
}