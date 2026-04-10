import Foundation

public struct TestSubmissionUpdateInfoFour: Codable, Hashable, Sendable {
    public let testCaseId: V2TestCaseId
    public let traceResponsesSize: Int
    public let type: TestSubmissionUpdateInfoFourType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        testCaseId: V2TestCaseId,
        traceResponsesSize: Int,
        type: TestSubmissionUpdateInfoFourType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.testCaseId = testCaseId
        self.traceResponsesSize = traceResponsesSize
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.testCaseId = try container.decode(V2TestCaseId.self, forKey: .testCaseId)
        self.traceResponsesSize = try container.decode(Int.self, forKey: .traceResponsesSize)
        self.type = try container.decode(TestSubmissionUpdateInfoFourType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.testCaseId, forKey: .testCaseId)
        try container.encode(self.traceResponsesSize, forKey: .traceResponsesSize)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case testCaseId
        case traceResponsesSize
        case type
    }
}