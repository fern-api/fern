import Foundation

public struct TestCaseGradeOne: Codable, Hashable, Sendable {
    public let passed: Bool
    public let actualResult: VariableValue?
    public let exception: ExceptionV2?
    public let stdout: String
    public let type: TestCaseGradeOneType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        passed: Bool,
        actualResult: VariableValue? = nil,
        exception: ExceptionV2? = nil,
        stdout: String,
        type: TestCaseGradeOneType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.passed = passed
        self.actualResult = actualResult
        self.exception = exception
        self.stdout = stdout
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.passed = try container.decode(Bool.self, forKey: .passed)
        self.actualResult = try container.decodeIfPresent(VariableValue.self, forKey: .actualResult)
        self.exception = try container.decodeIfPresent(ExceptionV2.self, forKey: .exception)
        self.stdout = try container.decode(String.self, forKey: .stdout)
        self.type = try container.decode(TestCaseGradeOneType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.passed, forKey: .passed)
        try container.encodeIfPresent(self.actualResult, forKey: .actualResult)
        try container.encodeIfPresent(self.exception, forKey: .exception)
        try container.encode(self.stdout, forKey: .stdout)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case passed
        case actualResult
        case exception
        case stdout
        case type
    }
}