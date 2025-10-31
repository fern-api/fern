public enum UnionWithSpecialCharacters: Codable, Hashable, Sendable {
    case abc(Abc)
    case abcdEfgh(AbcdEfgh)
    case camelCase(CamelCase)
    case dataPoint(DataPoint)
    case kebabCaseValue(KebabCaseValue)
    case leadingSpaces(LeadingSpaces)
    case mixed123Values456(Mixed123Values456)
    case oneAbc(OneAbc)
    case oneHundredTwentyThreeAbc(OneHundredTwentyThreeAbc)
    case pascalCase(PascalCase)
    case sevenAgent(SevenAgent)
    case snakeCaseValue(SnakeCaseValue)
    case spacesInTheMiddle(SpacesInTheMiddle)
    case special(Special)
    case trailingSpaces(TrailingSpaces)
    case twelveAbc(TwelveAbc)
    case uppercase(Uppercase)
    case userName(UserName)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "abc":
            self = .abc(try Abc(from: decoder))
        case "abcd-efgh":
            self = .abcdEfgh(try AbcdEfgh(from: decoder))
        case "camelCase":
            self = .camelCase(try CamelCase(from: decoder))
        case "data@point":
            self = .dataPoint(try DataPoint(from: decoder))
        case "kebab-case-value":
            self = .kebabCaseValue(try KebabCaseValue(from: decoder))
        case "  leading-spaces":
            self = .leadingSpaces(try LeadingSpaces(from: decoder))
        case "mixed123Values456":
            self = .mixed123Values456(try Mixed123Values456(from: decoder))
        case "1abc":
            self = .oneAbc(try OneAbc(from: decoder))
        case "123abc":
            self = .oneHundredTwentyThreeAbc(try OneHundredTwentyThreeAbc(from: decoder))
        case "PascalCase":
            self = .pascalCase(try PascalCase(from: decoder))
        case "007agent":
            self = .sevenAgent(try SevenAgent(from: decoder))
        case "snake_case_value":
            self = .snakeCaseValue(try SnakeCaseValue(from: decoder))
        case "spaces in the middle":
            self = .spacesInTheMiddle(try SpacesInTheMiddle(from: decoder))
        case "!@#$%special":
            self = .special(try Special(from: decoder))
        case "trailing-spaces ":
            self = .trailingSpaces(try TrailingSpaces(from: decoder))
        case "12abc":
            self = .twelveAbc(try TwelveAbc(from: decoder))
        case "UPPERCASE":
            self = .uppercase(try Uppercase(from: decoder))
        case "user#name":
            self = .userName(try UserName(from: decoder))
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
        case .abcdEfgh(let data):
            try data.encode(to: encoder)
        case .camelCase(let data):
            try data.encode(to: encoder)
        case .dataPoint(let data):
            try data.encode(to: encoder)
        case .kebabCaseValue(let data):
            try data.encode(to: encoder)
        case .leadingSpaces(let data):
            try data.encode(to: encoder)
        case .mixed123Values456(let data):
            try data.encode(to: encoder)
        case .oneAbc(let data):
            try data.encode(to: encoder)
        case .oneHundredTwentyThreeAbc(let data):
            try data.encode(to: encoder)
        case .pascalCase(let data):
            try data.encode(to: encoder)
        case .sevenAgent(let data):
            try data.encode(to: encoder)
        case .snakeCaseValue(let data):
            try data.encode(to: encoder)
        case .spacesInTheMiddle(let data):
            try data.encode(to: encoder)
        case .special(let data):
            try data.encode(to: encoder)
        case .trailingSpaces(let data):
            try data.encode(to: encoder)
        case .twelveAbc(let data):
            try data.encode(to: encoder)
        case .uppercase(let data):
            try data.encode(to: encoder)
        case .userName(let data):
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

    public struct OneAbc: Codable, Hashable, Sendable {
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

    public struct TwelveAbc: Codable, Hashable, Sendable {
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

    public struct OneHundredTwentyThreeAbc: Codable, Hashable, Sendable {
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

    public struct SevenAgent: Codable, Hashable, Sendable {
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

    public struct AbcdEfgh: Codable, Hashable, Sendable {
        public let type: String = "abcd-efgh"
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

    public struct TrailingSpaces: Codable, Hashable, Sendable {
        public let type: String = "trailing-spaces "
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

    public struct SpacesInTheMiddle: Codable, Hashable, Sendable {
        public let type: String = "spaces in the middle"
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