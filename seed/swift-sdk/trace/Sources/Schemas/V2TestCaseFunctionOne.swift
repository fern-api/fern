import Foundation

public struct V2TestCaseFunctionOne: Codable, Hashable, Sendable {
    public let parameters: [V2Parameter]
    public let code: V2FunctionImplementationForMultipleLanguages
    public let type: V2TestCaseFunctionOneType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        parameters: [V2Parameter],
        code: V2FunctionImplementationForMultipleLanguages,
        type: V2TestCaseFunctionOneType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.parameters = parameters
        self.code = code
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.parameters = try container.decode([V2Parameter].self, forKey: .parameters)
        self.code = try container.decode(V2FunctionImplementationForMultipleLanguages.self, forKey: .code)
        self.type = try container.decode(V2TestCaseFunctionOneType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.parameters, forKey: .parameters)
        try container.encode(self.code, forKey: .code)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case parameters
        case code
        case type
    }
}