import Foundation

public struct VoidFunctionDefinitionType: Codable, Hashable, Sendable {
    public let parameters: [ParameterType]
    public let code: FunctionImplementationForMultipleLanguagesType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        parameters: [ParameterType],
        code: FunctionImplementationForMultipleLanguagesType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.parameters = parameters
        self.code = code
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.parameters = try container.decode([ParameterType].self, forKey: .parameters)
        self.code = try container.decode(FunctionImplementationForMultipleLanguagesType.self, forKey: .code)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.parameters, forKey: .parameters)
        try container.encode(self.code, forKey: .code)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case parameters
        case code
    }
}