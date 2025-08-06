public enum TestCaseGrade: Codable, Hashable, Sendable {
    case hidden(Hidden)
    case nonHidden(NonHidden)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "hidden":
            self = .hidden(try Hidden(from: decoder))
        case "nonHidden":
            self = .nonHidden(try NonHidden(from: decoder))
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
        case .hidden(let data):
            try data.encode(to: encoder)
        case .nonHidden(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Hidden: Codable, Hashable, Sendable {
        public let type: String = "hidden"
        public let passed: Bool
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            passed: Bool,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.passed = passed
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.passed = try container.decode(Bool.self, forKey: .passed)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.passed, forKey: .passed)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case passed
        }
    }

    public struct NonHidden: Codable, Hashable, Sendable {
        public let type: String = "nonHidden"
        public let passed: Bool
        public let actualResult: VariableValue?
        public let exception: ExceptionV2?
        public let stdout: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            passed: Bool,
            actualResult: VariableValue? = nil,
            exception: ExceptionV2? = nil,
            stdout: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.passed = passed
            self.actualResult = actualResult
            self.exception = exception
            self.stdout = stdout
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.passed = try container.decode(Bool.self, forKey: .passed)
            self.actualResult = try container.decodeIfPresent(VariableValue.self, forKey: .actualResult)
            self.exception = try container.decodeIfPresent(ExceptionV2.self, forKey: .exception)
            self.stdout = try container.decode(String.self, forKey: .stdout)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.passed, forKey: .passed)
            try container.encodeIfPresent(self.actualResult, forKey: .actualResult)
            try container.encodeIfPresent(self.exception, forKey: .exception)
            try container.encode(self.stdout, forKey: .stdout)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case passed
            case actualResult
            case exception
            case stdout
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}