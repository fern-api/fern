public enum CustomFiles_: Codable, Hashable, Sendable {
    case basic(Basic)
    case custom(Custom)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "basic":
            self = .basic(try Basic(from: decoder))
        case "custom":
            self = .custom(try Custom(from: decoder))
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
        case .basic(let data):
            try data.encode(to: encoder)
        case .custom(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Basic: Codable, Hashable, Sendable {
        public let type: String = "basic"
        public let methodName: String
        public let signature: NonVoidFunctionSignature
        public let additionalFiles: [Language: Files]
        public let basicTestCaseTemplate: BasicTestCaseTemplate
        public let additionalProperties: [String: JSONValue]

        public init(
            methodName: String,
            signature: NonVoidFunctionSignature,
            additionalFiles: [Language: Files],
            basicTestCaseTemplate: BasicTestCaseTemplate,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.methodName = methodName
            self.signature = signature
            self.additionalFiles = additionalFiles
            self.basicTestCaseTemplate = basicTestCaseTemplate
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.methodName = try container.decode(String.self, forKey: .methodName)
            self.signature = try container.decode(NonVoidFunctionSignature.self, forKey: .signature)
            self.additionalFiles = try container.decode([Language: Files].self, forKey: .additionalFiles)
            self.basicTestCaseTemplate = try container.decode(BasicTestCaseTemplate.self, forKey: .basicTestCaseTemplate)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.methodName, forKey: .methodName)
            try container.encode(self.signature, forKey: .signature)
            try container.encode(self.additionalFiles, forKey: .additionalFiles)
            try container.encode(self.basicTestCaseTemplate, forKey: .basicTestCaseTemplate)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case methodName
            case signature
            case additionalFiles
            case basicTestCaseTemplate
        }
    }

    public struct Custom: Codable, Hashable, Sendable {
        public let type: String = "custom"
        public let value: [Language: Files]
        public let additionalProperties: [String: JSONValue]

        public init(
            value: [Language: Files],
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode([Language: Files].self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}