import Foundation

public struct TestCaseWithActualResultImplementation: Codable, Hashable, Sendable {
    public let getActualResult: NonVoidFunctionDefinition
    public let assertCorrectnessCheck: AssertCorrectnessCheck
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        getActualResult: NonVoidFunctionDefinition,
        assertCorrectnessCheck: AssertCorrectnessCheck,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.getActualResult = getActualResult
        self.assertCorrectnessCheck = assertCorrectnessCheck
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.getActualResult = try container.decode(NonVoidFunctionDefinition.self, forKey: .getActualResult)
        self.assertCorrectnessCheck = try container.decode(AssertCorrectnessCheck.self, forKey: .assertCorrectnessCheck)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.getActualResult, forKey: .getActualResult)
        try container.encode(self.assertCorrectnessCheck, forKey: .assertCorrectnessCheck)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case getActualResult
        case assertCorrectnessCheck
    }
}