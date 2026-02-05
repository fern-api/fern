public enum UnionWithDuplicateVariantDiscriminant: Codable, Hashable, Sendable {
    case variantA(VariantA)
    case variantB(VariantB)
    case variantC(VariantC)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "variantA":
            self = .variantA(try VariantA(from: decoder))
        case "variantB":
            self = .variantB(try VariantB(from: decoder))
        case "variantC":
            self = .variantC(try VariantC(from: decoder))
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
        case .variantA(let data):
            try data.encode(to: encoder)
        case .variantB(let data):
            try data.encode(to: encoder)
        case .variantC(let data):
            try data.encode(to: encoder)
        }
    }

    public struct VariantA: Codable, Hashable, Sendable {
        public let type: String = "variantA"
        public let propertyA: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            propertyA: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.propertyA = propertyA
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.propertyA = try container.decode(String.self, forKey: .propertyA)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.propertyA, forKey: .propertyA)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case propertyA
        }
    }

    public struct VariantB: Codable, Hashable, Sendable {
        public let type: String = "variantB"
        public let propertyB: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            propertyB: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.propertyB = propertyB
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.propertyB = try container.decode(String.self, forKey: .propertyB)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.propertyB, forKey: .propertyB)
        }

        public enum VariantB: String, Codable, Hashable, CaseIterable, Sendable {
            case variantB
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case propertyB
        }
    }

    public struct VariantC: Codable, Hashable, Sendable {
        public let type: String = "variantC"
        public let propertyC: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            propertyC: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.propertyC = propertyC
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.propertyC = try container.decode(String.self, forKey: .propertyC)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.propertyC, forKey: .propertyC)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case propertyC
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}