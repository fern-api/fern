import Foundation

public struct GradedTestCaseUpdate: Codable, Hashable, Sendable {
    public let testCaseId: TestCaseId
    public let grade: TestCaseGrade
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        testCaseId: TestCaseId,
        grade: TestCaseGrade,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.testCaseId = testCaseId
        self.grade = grade
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.testCaseId = try container.decode(TestCaseId.self, forKey: .testCaseId)
        self.grade = try container.decode(TestCaseGrade.self, forKey: .grade)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.testCaseId, forKey: .testCaseId)
        try container.encode(self.grade, forKey: .grade)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case testCaseId
        case grade
    }
}