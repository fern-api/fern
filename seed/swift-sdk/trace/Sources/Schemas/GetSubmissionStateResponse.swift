public struct GetSubmissionStateResponse: Codable, Hashable, Sendable {
    public let timeSubmitted: Date?
    public let submission: String
    public let language: Language
    public let submissionTypeState: SubmissionTypeState
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        timeSubmitted: Date? = nil,
        submission: String,
        language: Language,
        submissionTypeState: SubmissionTypeState,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.timeSubmitted = timeSubmitted
        self.submission = submission
        self.language = language
        self.submissionTypeState = submissionTypeState
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.timeSubmitted = try container.decodeIfPresent(Date.self, forKey: .timeSubmitted)
        self.submission = try container.decode(String.self, forKey: .submission)
        self.language = try container.decode(Language.self, forKey: .language)
        self.submissionTypeState = try container.decode(SubmissionTypeState.self, forKey: .submissionTypeState)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.timeSubmitted, forKey: .timeSubmitted)
        try container.encode(self.submission, forKey: .submission)
        try container.encode(self.language, forKey: .language)
        try container.encode(self.submissionTypeState, forKey: .submissionTypeState)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case timeSubmitted
        case submission
        case language
        case submissionTypeState
    }
}