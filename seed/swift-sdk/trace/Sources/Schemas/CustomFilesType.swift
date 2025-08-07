public enum CustomFilesType: Codable, Hashable, Sendable {
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
        public let signature: NonVoidFunctionSignatureType
        public let additionalFiles: [Language: FilesType]
        public let basicTestCaseTemplate: BasicTestCaseTemplateType
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            methodName: String,
            signature: NonVoidFunctionSignatureType,
            additionalFiles: [Language: FilesType],
            basicTestCaseTemplate: BasicTestCaseTemplateType,
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
            self.signature = try container.decode(NonVoidFunctionSignatureType.self, forKey: .signature)
            self.additionalFiles = try container.decode([Language: FilesType].self, forKey: .additionalFiles)
            self.basicTestCaseTemplate = try container.decode(BasicTestCaseTemplateType.self, forKey: .basicTestCaseTemplate)
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

        /// Keys for encoding/decoding struct properties.
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
        public let value: [Language: FilesType]
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: [Language: FilesType],
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode([Language: FilesType].self, forKey: .value)
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

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}