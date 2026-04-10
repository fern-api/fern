import Foundation

public struct TestSubmissionUpdateInfoThree: Codable, Hashable, Sendable {
    public let testCaseId: V2TestCaseId
    public let grade: TestCaseGrade
    public let type: TestSubmissionUpdateInfoThreeType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        testCaseId: V2TestCaseId,
        grade: TestCaseGrade,
        type: TestSubmissionUpdateInfoThreeType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.testCaseId = testCaseId
        self.grade = grade
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.testCaseId = try container.decode(V2TestCaseId.self, forKey: .testCaseId)
        self.grade = try container.decode(TestCaseGrade.self, forKey: .grade)
        self.type = try container.decode(TestSubmissionUpdateInfoThreeType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.testCaseId, forKey: .testCaseId)
        try container.encode(self.grade, forKey: .grade)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case testCaseId
        case grade
        case type
    }
}