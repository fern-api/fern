public enum InvalidRequestCause: Codable, Hashable, Sendable {
    case submissionIdNotFound(SubmissionIdNotFound)
    case customTestCasesUnsupported(CustomTestCasesUnsupported)
    case unexpectedLanguage(UnexpectedLanguage)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "submissionIdNotFound":
            self = .submissionIdNotFound(try SubmissionIdNotFound(from: decoder))
        case "customTestCasesUnsupported":
            self = .customTestCasesUnsupported(try CustomTestCasesUnsupported(from: decoder))
        case "unexpectedLanguage":
            self = .unexpectedLanguage(try UnexpectedLanguage(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        switch self {
        case .submissionIdNotFound(let data):
            try data.encode(to: encoder)
        case .customTestCasesUnsupported(let data):
            try data.encode(to: encoder)
        case .unexpectedLanguage(let data):
            try data.encode(to: encoder)
        }
    }

    public struct SubmissionIdNotFound: Codable, Hashable, Sendable {
        public let type: String = "submissionIdNotFound"
        public let missingSubmissionId: SubmissionId
        public let additionalProperties: [String: JSONValue]

        public init(
            missingSubmissionId: SubmissionId,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.missingSubmissionId = missingSubmissionId
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.missingSubmissionId = try container.decode(SubmissionId.self, forKey: .missingSubmissionId)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.missingSubmissionId, forKey: .missingSubmissionId)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case missingSubmissionId
        }
    }

    public struct CustomTestCasesUnsupported: Codable, Hashable, Sendable {
        public let type: String = "customTestCasesUnsupported"
        public let problemId: ProblemId
        public let submissionId: SubmissionId
        public let additionalProperties: [String: JSONValue]

        public init(
            problemId: ProblemId,
            submissionId: SubmissionId,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.problemId = problemId
            self.submissionId = submissionId
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.problemId, forKey: .problemId)
            try container.encode(self.submissionId, forKey: .submissionId)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case problemId
            case submissionId
        }
    }

    public struct UnexpectedLanguage: Codable, Hashable, Sendable {
        public let type: String = "unexpectedLanguage"
        public let expectedLanguage: Language
        public let actualLanguage: Language
        public let additionalProperties: [String: JSONValue]

        public init(
            expectedLanguage: Language,
            actualLanguage: Language,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.expectedLanguage = expectedLanguage
            self.actualLanguage = actualLanguage
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.expectedLanguage = try container.decode(Language.self, forKey: .expectedLanguage)
            self.actualLanguage = try container.decode(Language.self, forKey: .actualLanguage)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.expectedLanguage, forKey: .expectedLanguage)
            try container.encode(self.actualLanguage, forKey: .actualLanguage)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case expectedLanguage
            case actualLanguage
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}