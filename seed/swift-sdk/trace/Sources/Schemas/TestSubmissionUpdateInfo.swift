import Foundation

public enum TestSubmissionUpdateInfo: Codable, Hashable, Sendable {
    case errored(Errored)
    case finished(Finished)
    case gradedTestCase(GradedTestCase)
    case recordedTestCase(RecordedTestCase)
    case running(Running)
    case stopped(Stopped)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "errored":
            self = .errored(try Errored(from: decoder))
        case "finished":
            self = .finished(try Finished(from: decoder))
        case "gradedTestCase":
            self = .gradedTestCase(try GradedTestCase(from: decoder))
        case "recordedTestCase":
            self = .recordedTestCase(try RecordedTestCase(from: decoder))
        case "running":
            self = .running(try Running(from: decoder))
        case "stopped":
            self = .stopped(try Stopped(from: decoder))
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
        case .errored(let data):
            try data.encode(to: encoder)
        case .finished(let data):
            try data.encode(to: encoder)
        case .gradedTestCase(let data):
            try data.encode(to: encoder)
        case .recordedTestCase(let data):
            try data.encode(to: encoder)
        case .running(let data):
            try data.encode(to: encoder)
        case .stopped(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Running: Codable, Hashable, Sendable {
        public let type: String = "running"
        public let value: RunningSubmissionState
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: RunningSubmissionState,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(RunningSubmissionState.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.value, forKey: .value)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct Stopped: Codable, Hashable, Sendable {
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

    public struct Errored: Codable, Hashable, Sendable {
        public let type: String = "errored"
        public let value: ErrorInfo
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: ErrorInfo,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(ErrorInfo.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.value, forKey: .value)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct GradedTestCase: Codable, Hashable, Sendable {
        public let type: String = "gradedTestCase"
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
            try container.encode(self.type, forKey: .type)
            try container.encode(self.testCaseId, forKey: .testCaseId)
            try container.encode(self.grade, forKey: .grade)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case testCaseId
            case grade
        }
    }

    public struct RecordedTestCase: Codable, Hashable, Sendable {
        public let type: String = "recordedTestCase"
        public let testCaseId: TestCaseId
        public let traceResponsesSize: Int
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            testCaseId: TestCaseId,
            traceResponsesSize: Int,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.testCaseId = testCaseId
            self.traceResponsesSize = traceResponsesSize
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.testCaseId = try container.decode(TestCaseId.self, forKey: .testCaseId)
            self.traceResponsesSize = try container.decode(Int.self, forKey: .traceResponsesSize)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.testCaseId, forKey: .testCaseId)
            try container.encode(self.traceResponsesSize, forKey: .traceResponsesSize)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case testCaseId
            case traceResponsesSize
        }
    }

    public struct Finished: Codable, Hashable, Sendable {
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

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}