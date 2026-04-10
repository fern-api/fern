import Foundation

public struct SubmissionStatusForTestCaseTwo: Codable, Hashable, Sendable {
    public let result: TestCaseResultWithStdout
    public let traceResponsesSize: Int
    public let type: SubmissionStatusForTestCaseTwoType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        result: TestCaseResultWithStdout,
        traceResponsesSize: Int,
        type: SubmissionStatusForTestCaseTwoType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.result = result
        self.traceResponsesSize = traceResponsesSize
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.result = try container.decode(TestCaseResultWithStdout.self, forKey: .result)
        self.traceResponsesSize = try container.decode(Int.self, forKey: .traceResponsesSize)
        self.type = try container.decode(SubmissionStatusForTestCaseTwoType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.result, forKey: .result)
        try container.encode(self.traceResponsesSize, forKey: .traceResponsesSize)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case result
        case traceResponsesSize
        case type
    }
}