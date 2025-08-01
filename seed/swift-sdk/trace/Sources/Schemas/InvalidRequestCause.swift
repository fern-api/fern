public enum InvalidRequestCause: Codable, Hashable, Sendable {
    case submissionIdNotFound(SubmissionIdNotFound)
    case customTestCasesUnsupported(CustomTestCasesUnsupported)
    case unexpectedLanguage(UnexpectedLanguage)

    public struct SubmissionIdNotFound: Codable, Hashable, Sendable {
        public let type: String = "submissionIdNotFound"
        public let missingSubmissionId: SubmissionId
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            missingSubmissionId: SubmissionId,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.missingSubmissionId = missingSubmissionId
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.missingSubmissionId = try container.decode(SubmissionId.self, forKey: .missingSubmissionId)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.missingSubmissionId, forKey: .missingSubmissionId)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case missingSubmissionId = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct CustomTestCasesUnsupported: Codable, Hashable, Sendable {
        public let type: String = "customTestCasesUnsupported"
        public let problemId: ProblemId
        public let submissionId: SubmissionId
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            problemId: ProblemId,
            submissionId: SubmissionId,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.problemId = problemId
            self.submissionId = submissionId
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.problemId, forKey: .problemId)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case problemId = "placeholder"
            case submissionId = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct UnexpectedLanguage: Codable, Hashable, Sendable {
        public let type: String = "unexpectedLanguage"
        public let expectedLanguage: Language
        public let actualLanguage: Language
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            expectedLanguage: Language,
            actualLanguage: Language,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.expectedLanguage = expectedLanguage
            self.actualLanguage = actualLanguage
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.expectedLanguage = try container.decode(Language.self, forKey: .expectedLanguage)
            self.actualLanguage = try container.decode(Language.self, forKey: .actualLanguage)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.expectedLanguage, forKey: .expectedLanguage)
            try container.encode(self.actualLanguage, forKey: .actualLanguage)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case expectedLanguage = "placeholder"
            case actualLanguage = "placeholder"
            case additionalProperties = "placeholder"
        }
    }
}