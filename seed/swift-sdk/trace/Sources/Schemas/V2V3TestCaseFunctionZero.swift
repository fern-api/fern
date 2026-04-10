import Foundation

public struct V2V3TestCaseFunctionZero: Codable, Hashable, Sendable {
    public let getActualResult: V2V3NonVoidFunctionDefinition
    public let assertCorrectnessCheck: V2V3AssertCorrectnessCheck
    public let type: V2V3TestCaseFunctionZeroType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        getActualResult: V2V3NonVoidFunctionDefinition,
        assertCorrectnessCheck: V2V3AssertCorrectnessCheck,
        type: V2V3TestCaseFunctionZeroType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.getActualResult = getActualResult
        self.assertCorrectnessCheck = assertCorrectnessCheck
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.getActualResult = try container.decode(V2V3NonVoidFunctionDefinition.self, forKey: .getActualResult)
        self.assertCorrectnessCheck = try container.decode(V2V3AssertCorrectnessCheck.self, forKey: .assertCorrectnessCheck)
        self.type = try container.decode(V2V3TestCaseFunctionZeroType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.getActualResult, forKey: .getActualResult)
        try container.encode(self.assertCorrectnessCheck, forKey: .assertCorrectnessCheck)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case getActualResult
        case assertCorrectnessCheck
        case type
    }
}