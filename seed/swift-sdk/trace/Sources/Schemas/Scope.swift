public struct Scope: Codable, Hashable {
    public let variables: [String: DebugVariableValue]
    public let additionalProperties: [String: JSONValue]

    public init(
        variables: [String: DebugVariableValue],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.variables = variables
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.variables = try container.decode([String: DebugVariableValue].self, forKey: .variables)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.variables, forKey: .variables)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case variables
    }
}