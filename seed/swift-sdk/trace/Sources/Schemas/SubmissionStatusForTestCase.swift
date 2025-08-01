public enum SubmissionStatusForTestCase: Codable, Hashable, Sendable {
    case graded(Graded)
    case gradedV2(GradedV2)
    case traced(Traced)

    public struct Graded: Codable, Hashable, Sendable {
        public let type: String = "graded"
        public let result: TestCaseResult
        public let stdout: String
        public let additionalProperties: [String: JSONValue]

        public init(
            result: TestCaseResult,
            stdout: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.result = result
            self.stdout = stdout
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.result = try container.decode(TestCaseResult.self, forKey: .result)
            self.stdout = try container.decode(String.self, forKey: .stdout)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.result, forKey: .result)
            try container.encode(self.stdout, forKey: .stdout)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case result
            case stdout
        }
    }

    public struct GradedV2: Codable, Hashable, Sendable {
        public let type: String = "gradedV2"
        public let value: TestCaseGrade
        public let additionalProperties: [String: JSONValue]

        public init(
            value: TestCaseGrade,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(TestCaseGrade.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case value
        }
    }

    public struct Traced: Codable, Hashable, Sendable {
        public let type: String = "traced"
        public let result: TestCaseResultWithStdout
        public let traceResponsesSize: Int
        public let additionalProperties: [String: JSONValue]

        public init(
            result: TestCaseResultWithStdout,
            traceResponsesSize: Int,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.result = result
            self.traceResponsesSize = traceResponsesSize
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.result = try container.decode(TestCaseResultWithStdout.self, forKey: .result)
            self.traceResponsesSize = try container.decode(Int.self, forKey: .traceResponsesSize)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.result, forKey: .result)
            try container.encode(self.traceResponsesSize, forKey: .traceResponsesSize)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case result
            case traceResponsesSize
        }
    }
}