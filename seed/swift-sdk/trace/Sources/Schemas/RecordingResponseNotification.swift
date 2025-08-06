public struct RecordingResponseNotification: Codable, Hashable, Sendable {
    public let submissionId: SubmissionId
    public let testCaseId: String?
    public let lineNumber: Int
    public let lightweightStackInfo: LightweightStackframeInformation
    public let tracedFile: TracedFile?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        submissionId: SubmissionId,
        testCaseId: String? = nil,
        lineNumber: Int,
        lightweightStackInfo: LightweightStackframeInformation,
        tracedFile: TracedFile? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.submissionId = submissionId
        self.testCaseId = testCaseId
        self.lineNumber = lineNumber
        self.lightweightStackInfo = lightweightStackInfo
        self.tracedFile = tracedFile
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
        self.testCaseId = try container.decodeIfPresent(String.self, forKey: .testCaseId)
        self.lineNumber = try container.decode(Int.self, forKey: .lineNumber)
        self.lightweightStackInfo = try container.decode(LightweightStackframeInformation.self, forKey: .lightweightStackInfo)
        self.tracedFile = try container.decodeIfPresent(TracedFile.self, forKey: .tracedFile)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.submissionId, forKey: .submissionId)
        try container.encodeIfPresent(self.testCaseId, forKey: .testCaseId)
        try container.encode(self.lineNumber, forKey: .lineNumber)
        try container.encode(self.lightweightStackInfo, forKey: .lightweightStackInfo)
        try container.encodeIfPresent(self.tracedFile, forKey: .tracedFile)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case submissionId
        case testCaseId
        case lineNumber
        case lightweightStackInfo
        case tracedFile
    }
}