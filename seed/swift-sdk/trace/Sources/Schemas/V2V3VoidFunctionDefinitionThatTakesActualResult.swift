import Foundation

/// The generated signature will include an additional param, actualResult
public struct V2V3VoidFunctionDefinitionThatTakesActualResult: Codable, Hashable, Sendable {
    public let additionalParameters: [V2V3Parameter]
    public let code: V2V3FunctionImplementationForMultipleLanguages
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        additionalParameters: [V2V3Parameter],
        code: V2V3FunctionImplementationForMultipleLanguages,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.additionalParameters = additionalParameters
        self.code = code
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.additionalParameters = try container.decode([V2V3Parameter].self, forKey: .additionalParameters)
        self.code = try container.decode(V2V3FunctionImplementationForMultipleLanguages.self, forKey: .code)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.additionalParameters, forKey: .additionalParameters)
        try container.encode(self.code, forKey: .code)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case additionalParameters
        case code
    }
}