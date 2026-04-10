import Foundation

public struct TestCaseGradeZero: Codable, Hashable, Sendable {
    public let passed: Bool
    public let type: TestCaseGradeZeroType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        passed: Bool,
        type: TestCaseGradeZeroType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.passed = passed
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.passed = try container.decode(Bool.self, forKey: .passed)
        self.type = try container.decode(TestCaseGradeZeroType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.passed, forKey: .passed)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case passed
        case type
    }
}