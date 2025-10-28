import Foundation

public enum SubmissionRequest: Codable, Hashable, Sendable {
    case initializeProblemRequest(InitializeProblemRequest)
    case initializeWorkspaceRequest(InitializeWorkspaceRequest)
    case stop(Stop)
    case submitV2(SubmitV2)
    case workspaceSubmit(WorkspaceSubmit)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "initializeProblemRequest":
            self = .initializeProblemRequest(try InitializeProblemRequest(from: decoder))
        case "initializeWorkspaceRequest":
            self = .initializeWorkspaceRequest(try InitializeWorkspaceRequest(from: decoder))
        case "stop":
            self = .stop(try Stop(from: decoder))
        case "submitV2":
            self = .submitV2(try SubmitV2(from: decoder))
        case "workspaceSubmit":
            self = .workspaceSubmit(try WorkspaceSubmit(from: decoder))
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
        case .initializeProblemRequest(let data):
            try data.encode(to: encoder)
        case .initializeWorkspaceRequest(let data):
            try data.encode(to: encoder)
        case .stop(let data):
            try data.encode(to: encoder)
        case .submitV2(let data):
            try data.encode(to: encoder)
        case .workspaceSubmit(let data):
            try data.encode(to: encoder)
        }
    }

    public struct InitializeProblemRequest: Codable, Hashable, Sendable {
        public let type: String = "initializeProblemRequest"
        public let problemId: ProblemId
        public let problemVersion: Int?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            problemId: ProblemId,
            problemVersion: Int? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.problemId = problemId
            self.problemVersion = problemVersion
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
            self.problemVersion = try container.decodeIfPresent(Int.self, forKey: .problemVersion)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.problemId, forKey: .problemId)
            try container.encodeIfPresent(self.problemVersion, forKey: .problemVersion)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case problemId
            case problemVersion
        }
    }

    public struct InitializeWorkspaceRequest: Codable, Hashable, Sendable {
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            self.additionalProperties = try decoder.decodeAdditionalProperties(knownKeys: [])
        }

        public func encode(to encoder: Encoder) throws -> Void {
            try encoder.encodeAdditionalProperties(self.additionalProperties)
        }
    }

    public struct SubmitV2: Codable, Hashable, Sendable {
        public let type: String = "submitV2"
        public let submissionId: SubmissionId
        public let language: Language
        public let submissionFiles: [SubmissionFileInfo]
        public let problemId: ProblemId
        public let problemVersion: Int?
        public let userId: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            language: Language,
            submissionFiles: [SubmissionFileInfo],
            problemId: ProblemId,
            problemVersion: Int? = nil,
            userId: String? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.language = language
            self.submissionFiles = submissionFiles
            self.problemId = problemId
            self.problemVersion = problemVersion
            self.userId = userId
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.language = try container.decode(Language.self, forKey: .language)
            self.submissionFiles = try container.decode([SubmissionFileInfo].self, forKey: .submissionFiles)
            self.problemId = try container.decode(ProblemId.self, forKey: .problemId)
            self.problemVersion = try container.decodeIfPresent(Int.self, forKey: .problemVersion)
            self.userId = try container.decodeIfPresent(String.self, forKey: .userId)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.language, forKey: .language)
            try container.encode(self.submissionFiles, forKey: .submissionFiles)
            try container.encode(self.problemId, forKey: .problemId)
            try container.encodeIfPresent(self.problemVersion, forKey: .problemVersion)
            try container.encodeIfPresent(self.userId, forKey: .userId)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case submissionId
            case language
            case submissionFiles
            case problemId
            case problemVersion
            case userId
        }
    }

    public struct WorkspaceSubmit: Codable, Hashable, Sendable {
        public let type: String = "workspaceSubmit"
        public let submissionId: SubmissionId
        public let language: Language
        public let submissionFiles: [SubmissionFileInfo]
        public let userId: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            language: Language,
            submissionFiles: [SubmissionFileInfo],
            userId: String? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.language = language
            self.submissionFiles = submissionFiles
            self.userId = userId
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.language = try container.decode(Language.self, forKey: .language)
            self.submissionFiles = try container.decode([SubmissionFileInfo].self, forKey: .submissionFiles)
            self.userId = try container.decodeIfPresent(String.self, forKey: .userId)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.language, forKey: .language)
            try container.encode(self.submissionFiles, forKey: .submissionFiles)
            try container.encodeIfPresent(self.userId, forKey: .userId)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case submissionId
            case language
            case submissionFiles
            case userId
        }
    }

    public struct Stop: Codable, Hashable, Sendable {
        public let type: String = "stop"
        public let submissionId: SubmissionId
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.submissionId, forKey: .submissionId)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case submissionId
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}