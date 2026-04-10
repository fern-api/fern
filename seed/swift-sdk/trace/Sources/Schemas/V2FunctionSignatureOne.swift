import Foundation

public struct V2FunctionSignatureOne: Codable, Hashable, Sendable {
    public let parameters: [V2Parameter]
    public let returnType: VariableType
    public let type: V2FunctionSignatureOneType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        parameters: [V2Parameter],
        returnType: VariableType,
        type: V2FunctionSignatureOneType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.parameters = parameters
        self.returnType = returnType
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.parameters = try container.decode([V2Parameter].self, forKey: .parameters)
        self.returnType = try container.decode(VariableType.self, forKey: .returnType)
        self.type = try container.decode(V2FunctionSignatureOneType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.parameters, forKey: .parameters)
        try container.encode(self.returnType, forKey: .returnType)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case parameters
        case returnType
        case type
    }
}