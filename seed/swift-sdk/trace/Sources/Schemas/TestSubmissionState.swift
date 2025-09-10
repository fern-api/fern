import Foundation

public struct TestSubmissionState: Codable, Hashable, Sendable {
    public let problemId: ProblemId
    public let defaultTestCases: [TestCase]
    public let customTestCases: [TestCase]
    public let status: TestSubmissionStatus
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        problemId: ProblemId,
        defaultTestCases: [TestCase],
        customTestCases: [TestCase],
        status: TestSubmissionStatus,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.problemId = problemId
        self.defaultTestCases = defaultTestCases
        self.customTestCases = customTestCases
        self.status = status
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
        self.defaultTestCases = try container.decode([TestCase].self, forKey: .defaultTestCases)
        self.customTestCases = try container.decode([TestCase].self, forKey: .customTestCases)
        self.status = try container.decode(TestSubmissionStatus.self, forKey: .status)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.problemId, forKey: .problemId)
        try container.encode(self.defaultTestCases, forKey: .defaultTestCases)
        try container.encode(self.customTestCases, forKey: .customTestCases)
        try container.encode(self.status, forKey: .status)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case problemId
        case defaultTestCases
        case customTestCases
        case status
    }
}