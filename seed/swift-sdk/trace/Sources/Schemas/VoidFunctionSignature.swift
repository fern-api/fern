public struct VoidFunctionSignature: Codable, Hashable {
    public let parameters: [Parameter]
    public let additionalProperties: [String: JSONValue]

    public init(
        parameters: [Parameter],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.parameters = parameters
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.parameters = try container.decode([Parameter].self, forKey: .parameters)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.parameters, forKey: .parameters)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case parameters
    }
}