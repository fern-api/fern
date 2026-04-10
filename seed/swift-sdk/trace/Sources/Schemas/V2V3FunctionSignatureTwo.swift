import Foundation

public struct V2V3FunctionSignatureTwo: Codable, Hashable, Sendable {
    public let parameters: [V2V3Parameter]
    public let actualResultType: VariableType
    public let type: V2V3FunctionSignatureTwoType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        parameters: [V2V3Parameter],
        actualResultType: VariableType,
        type: V2V3FunctionSignatureTwoType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.parameters = parameters
        self.actualResultType = actualResultType
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.parameters = try container.decode([V2V3Parameter].self, forKey: .parameters)
        self.actualResultType = try container.decode(VariableType.self, forKey: .actualResultType)
        self.type = try container.decode(V2V3FunctionSignatureTwoType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.parameters, forKey: .parameters)
        try container.encode(self.actualResultType, forKey: .actualResultType)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case parameters
        case actualResultType
        case type
    }
}