public enum UnionWithSpecialCharacters: Codable, Hashable, Sendable {
    case abc(Abc)
    case aBc(ABc)
    case oneabc(Oneabc)
    case twelveabc(Twelveabc)
    case onehundredtwentythreeabc(Onehundredtwentythreeabc)
    case sevenagent(Sevenagent)
    case onehundredtwentythreeAbc(OnehundredtwentythreeAbc)
    case dataPoint(DataPoint)
    case userName(UserName)
    case snakeCaseValue(SnakeCaseValue)
    case kebabCaseValue(KebabCaseValue)
    case special(Special)
    case leadingSpaces(LeadingSpaces)
    case uppercase(Uppercase)
    case camelCase(CamelCase)
    case pascalCase(PascalCase)
    case mixed123Values456(Mixed123Values456)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "abc":
            self = .abc(try Abc(from: decoder))
        case "a b c":
            self = .aBc(try ABc(from: decoder))
        case "1abc":
            self = .oneabc(try Oneabc(from: decoder))
        case "12abc":
            self = .twelveabc(try Twelveabc(from: decoder))
        case "123abc":
            self = .onehundredtwentythreeabc(try Onehundredtwentythreeabc(from: decoder))
        case "007agent":
            self = .sevenagent(try Sevenagent(from: decoder))
        case "123-abc":
            self = .onehundredtwentythreeAbc(try OnehundredtwentythreeAbc(from: decoder))
        case "data@point":
            self = .dataPoint(try DataPoint(from: decoder))
        case "user#name":
            self = .userName(try UserName(from: decoder))
        case "snake_case_value":
            self = .snakeCaseValue(try SnakeCaseValue(from: decoder))
        case "kebab-case-value":
            self = .kebabCaseValue(try KebabCaseValue(from: decoder))
        case "!@#$%special":
            self = .special(try Special(from: decoder))
        case "  leading-spaces":
            self = .leadingSpaces(try LeadingSpaces(from: decoder))
        case "UPPERCASE":
            self = .uppercase(try Uppercase(from: decoder))
        case "camelCase":
            self = .camelCase(try CamelCase(from: decoder))
        case "PascalCase":
            self = .pascalCase(try PascalCase(from: decoder))
        case "mixed123Values456":
            self = .mixed123Values456(try Mixed123Values456(from: decoder))
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
        case .abc(let data):
            try data.encode(to: encoder)
        case .aBc(let data):
            try data.encode(to: encoder)
        case .oneabc(let data):
            try data.encode(to: encoder)
        case .twelveabc(let data):
            try data.encode(to: encoder)
        case .onehundredtwentythreeabc(let data):
            try data.encode(to: encoder)
        case .sevenagent(let data):
            try data.encode(to: encoder)
        case .onehundredtwentythreeAbc(let data):
            try data.encode(to: encoder)
        case .dataPoint(let data):
            try data.encode(to: encoder)
        case .userName(let data):
            try data.encode(to: encoder)
        case .snakeCaseValue(let data):
            try data.encode(to: encoder)
        case .kebabCaseValue(let data):
            try data.encode(to: encoder)
        case .special(let data):
            try data.encode(to: encoder)
        case .leadingSpaces(let data):
            try data.encode(to: encoder)
        case .uppercase(let data):
            try data.encode(to: encoder)
        case .camelCase(let data):
            try data.encode(to: encoder)
        case .pascalCase(let data):
            try data.encode(to: encoder)
        case .mixed123Values456(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Abc: Codable, Hashable, Sendable {
        public let type: String = "abc"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct ABc: Codable, Hashable, Sendable {
        public let type: String = "a b c"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct Oneabc: Codable, Hashable, Sendable {
        public let type: String = "1abc"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct Twelveabc: Codable, Hashable, Sendable {
        public let type: String = "12abc"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct Onehundredtwentythreeabc: Codable, Hashable, Sendable {
        public let type: String = "123abc"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct Sevenagent: Codable, Hashable, Sendable {
        public let type: String = "007agent"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct OnehundredtwentythreeAbc: Codable, Hashable, Sendable {
        public let type: String = "123-abc"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct DataPoint: Codable, Hashable, Sendable {
        public let type: String = "data@point"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct UserName: Codable, Hashable, Sendable {
        public let type: String = "user#name"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct SnakeCaseValue: Codable, Hashable, Sendable {
        public let type: String = "snake_case_value"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct KebabCaseValue: Codable, Hashable, Sendable {
        public let type: String = "kebab-case-value"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct Special: Codable, Hashable, Sendable {
        public let type: String = "!@#$%special"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct LeadingSpaces: Codable, Hashable, Sendable {
        public let type: String = "  leading-spaces"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct Uppercase: Codable, Hashable, Sendable {
        public let type: String = "UPPERCASE"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct CamelCase: Codable, Hashable, Sendable {
        public let type: String = "camelCase"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct PascalCase: Codable, Hashable, Sendable {
        public let type: String = "PascalCase"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    public struct Mixed123Values456: Codable, Hashable, Sendable {
        public let type: String = "mixed123Values456"
        public let someValue: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            someValue: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.someValue = someValue
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.someValue = try container.decode(String.self, forKey: .someValue)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.someValue, forKey: .someValue)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case someValue = "some_value"
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}