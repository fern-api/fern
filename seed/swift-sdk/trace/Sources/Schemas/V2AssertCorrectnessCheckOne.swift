import Foundation

public struct V2AssertCorrectnessCheckOne: Codable, Hashable, Sendable {
    public let additionalParameters: [V2Parameter]
    public let code: V2FunctionImplementationForMultipleLanguages
    public let type: V2AssertCorrectnessCheckOneType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        additionalParameters: [V2Parameter],
        code: V2FunctionImplementationForMultipleLanguages,
        type: V2AssertCorrectnessCheckOneType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.additionalParameters = additionalParameters
        self.code = code
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.additionalParameters = try container.decode([V2Parameter].self, forKey: .additionalParameters)
        self.code = try container.decode(V2FunctionImplementationForMultipleLanguages.self, forKey: .code)
        self.type = try container.decode(V2AssertCorrectnessCheckOneType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.additionalParameters, forKey: .additionalParameters)
        try container.encode(self.code, forKey: .code)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case additionalParameters
        case code
        case type
    }
}